import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
    }

    const samplePayload = {
      event: "prompt.created",
      timestamp: new Date().toISOString(),
      test: true,
      data: {
        id: "test-" + Math.random().toString(36).substring(2, 9),
        title: "Test AI Workflow Prompt",
        content: "You are an expert AI architect. This is a test webhook payload sent from PromptMemory Settings to verify workflow automation field mapping in Zapier, Make, or n8n.",
        category: "Coding",
        tags: ["test", "webhook", "automation", "promptmemory"],
        platform: "web",
        role: "user",
        image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PromptMemory-Event': 'prompt.created',
        'X-PromptMemory-Test': 'true'
      },
      body: JSON.stringify(samplePayload)
    });

    const statusText = res.statusText || 'OK';
    if (!res.ok) {
      return NextResponse.json({ 
        success: false, 
        status: res.status, 
        error: `Webhook responded with status ${res.status}: ${statusText}` 
      }, { status: res.status });
    }

    return NextResponse.json({ 
      success: true, 
      status: res.status, 
      message: `Successfully fired test payload to ${new URL(url).hostname}` 
    });
  } catch (error: any) {
    console.error("Test Webhook API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to trigger webhook endpoint' 
    }, { status: 500 });
  }
}
