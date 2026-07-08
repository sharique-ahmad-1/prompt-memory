/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Basic Rate Limiter (In-Memory for Dev/Warm Lambdas)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT = 10 // max requests
const WINDOW_MS = 60 * 1000 // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return false
  }
  
  if (record.count >= RATE_LIMIT) {
    return true
  }
  
  record.count += 1
  return false
}

// Simple exponential backoff retry wrapper
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0
  while (attempt < maxRetries) {
    try {
      return await fn()
    } catch (error: any) {
      attempt++
      if (attempt >= maxRetries) throw error
      // Do not retry on 4xx errors like 401 Unauthorized or 400 Bad Request (except 429 rate limit)
      if (error?.status && error.status >= 400 && error.status !== 429 && error.status < 500) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  throw new Error("Retry failed")
}

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again in a minute.' }, { status: 429 })
    }

    const body = await req.json()
    const { transcript, projectData, meshConfig, provider } = body

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
    }

    // 2. Resolve AI Fiesta Mesh API Configuration
    // Priority: Frontend user settings -> Server environment variables -> Fallback defaults
    const apiKey = meshConfig?.apiKey || process.env.MESH_API_KEY || process.env.OPENAI_API_KEY
    const baseURL = meshConfig?.baseUrl || process.env.MESH_API_BASE_URL || 'https://api.aifiesta.ai/v1'
    const modelName = meshConfig?.model || process.env.MESH_API_MODEL || 'gpt-4o'

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API_KEY_MISSING', 
        message: 'Mesh API Key is not configured. Please add your AI Fiesta Mesh API Key (`rsk_...`) on the Settings page or via server environment variables.',
        provider: 'mesh-api'
      }, { status: 400 })
    }

    const systemPrompt = `You are an elite Senior Product Manager and SaaS Architect AI. 
Your objective is to deeply analyze the provided conversation transcript and extract actionable intelligence, inferences, and a highly polished continuation plan.

Context about the active project you are analyzing:
${projectData ? `
Project Title: ${projectData.title || 'Unknown'}
Goals: ${projectData.goals || 'None set'}
Key Decisions so far: ${projectData.key_decisions || 'None'}
Linked Prompts (Core Instructions):
${projectData.prompts && projectData.prompts.length > 0 
  ? projectData.prompts.map((p: any) => `- ${p.title}: ${p.content}`).join('\n') 
  : 'None linked.'}
` : 'No prior context provided. Proceed based entirely on the transcript.'}

Instructions:
1. Provide a rich, insightful analysis. Do not just summarize; infer meaning, intent, and unstated requirements where supported by context.
2. Use professional, SaaS-grade terminology.
3. Ensure all lists are formatted as proper bullet points starting with "- ".
4. Output a strictly formatted JSON object with the following exact keys (no markdown formatting outside the JSON):

{
  "executiveSummary": "A high-level, professional summary of the current state, progress made, and key takeaways from the transcript.",
  "projectGoal": "The overarching, inferred or explicit project goal.",
  "currentStatus": "A detailed explanation of where the project currently stands.",
  "keyDecisions": "- Bulleted list of architectural, design, or functional decisions made.",
  "completedWork": "- Bulleted list of completed features or tasks.",
  "activeProblems": "- Bulleted list of current blockers, bugs, or unresolved issues.",
  "pendingWork": "- Bulleted list of tasks that remain to be done.",
  "risks": "- Bulleted list of inferred or explicit risks (e.g., technical debt, timeline, edge cases).",
  "recommendedNextActions": "- Bulleted list of strategic recommendations for the very next steps.",
  "aiContinuationContext": "A dense paragraph intended for an LLM to read, summarizing the technical context needed to continue work seamlessly.",
  "readyToPasteContinuationPrompt": "A comprehensive, expertly crafted prompt the user can copy/paste into an AI to resume work immediately. It should incorporate the AI Continuation Context, state the immediate goals, and establish the required persona."
}`

    console.log("======================================================")
    console.log(`[DEBUG] Sending Prompt to Mesh API via OpenAI SDK`)
    console.log(`[DEBUG] BaseURL: ${baseURL} | Model: ${modelName}`)
    console.log("======================================================")
    console.log("------- User Transcript Length:", transcript.length, "chars -------")

    // 3. Initialize OpenAI Client configured with AI Fiesta Mesh Gateway baseURL
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    })

    // 4. Execute Chat Completion with Retry logic
    const completion = await withRetry(async () => {
      return await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: "TRANSCRIPT TO ANALYZE:\n" + transcript }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    console.log("[DEBUG] RAW MESH API RESPONSE LENGTH:", responseText.length)
    
    let parsed
    try {
      parsed = JSON.parse(responseText)
    } catch (e) {
      // Strip markdown code block wrappers if model wrapped it in ```json ... ```
      const cleaned = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      try {
        parsed = JSON.parse(cleaned)
      } catch (e2) {
        return NextResponse.json({ error: 'Parse Failed', message: 'Model returned malformed JSON output.', rawResponse: responseText }, { status: 500 })
      }
    }

    return NextResponse.json(parsed)

  } catch (error: any) {
    // 5. Strict Safe Error Handling (scrubbing API keys)
    const errorMsg = error.message || 'Unknown error occurred communicating with Mesh API'
    const status = error.status || error.statusCode || 500
    
    // Scrub sensitive credentials from log and response strings
    const scrubbedMsg = errorMsg.replace(/rsk_[A-Za-z0-9]+/g, '[REDACTED_KEY]').replace(/sk-[A-Za-z0-9]+/g, '[REDACTED_KEY]')
    
    console.error(`[MESH API ERROR - Status ${status}]:`, scrubbedMsg)
    
    let cleanUserMessage = scrubbedMsg
    if (status === 401 || scrubbedMsg.toLowerCase().includes('unauthorized') || scrubbedMsg.toLowerCase().includes('invalid api key')) {
      cleanUserMessage = 'Authentication failed: Your Mesh API Key (`rsk_...`) is invalid or expired. Please update your key in the AI Settings page.'
    } else if (status === 404 || scrubbedMsg.toLowerCase().includes('not found')) {
      cleanUserMessage = `Endpoint not found: Please verify your Mesh API Base URL and Model Name inside Settings.`
    } else if (status === 429 || scrubbedMsg.toLowerCase().includes('rate limit')) {
      cleanUserMessage = `Rate limit reached on Mesh API. Please wait a few seconds and try again.`
    }

    return NextResponse.json({ 
      error: status === 401 ? 'API_KEY_INVALID' : 'Generation Failed', 
      message: cleanUserMessage,
      status: status
    }, { status: status === 401 ? 401 : status === 429 ? 429 : 500 })
  }
}