import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const authHeader = req.headers.get('Authorization')

    if (!query) {
      return NextResponse.json({ data: [] })
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
    
    const result = await model.embedContent(query)
    const query_embedding = result.embedding.values

    const { data, error } = await supabase.rpc('match_prompts', {
      query_embedding,
      match_threshold: 0.6, // You can adjust this threshold based on results
      match_count: 5
    })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('Search error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
