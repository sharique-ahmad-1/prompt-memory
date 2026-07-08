import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { prompt_id, content } = await req.json()
    const authHeader = req.headers.get('Authorization')
    
    if (!prompt_id || !content) {
      return NextResponse.json({ error: 'Missing prompt_id or content' }, { status: 400 })
    }

    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    
    const result = await model.embedContent(content)
    const embedding = result.embedding.values

    const { error } = await supabase
      .from('prompts')
      .update({ embedding })
      .eq('id', prompt_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Embedding error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
