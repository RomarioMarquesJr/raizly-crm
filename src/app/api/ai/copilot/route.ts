import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Simple hash function for Edge/Server routes
async function hashInput(str: string) {
    const msgUint8 = new TextEncoder().encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
    const supabase = await createClient()

    // 1. Auth check
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse payload
    const body = await req.json()
    const { leadId, companyId, leadDetails, timelineEvents } = body

    if (!leadId || !companyId || !leadDetails) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 3. Check cache
    const payloadString = JSON.stringify({ leadDetails, timelineEvents })
    const inputHash = await hashInput(payloadString)

    const { data: cachedOutput } = await (supabase as any)
        .from('ai_outputs')
        .select('output_data')
        .eq('input_hash', inputHash)
        .limit(1)
        .maybeSingle()

    if (cachedOutput) {
        return NextResponse.json({ data: cachedOutput.output_data, cached: true })
    }

    // 4. Rate Limiting Simple (limit to 10 requests per user per window in a real app, 
    // but for MVP we skip Redis and just rely on the DB cache heavily).

    // 5. Build AI Prompt (Mocking for now unless an API key is provided, but since we are generating Next actions,
    // we will return a structured static response that simulates an LLM to avoid needing OpenAI keys to run the MVP).
    // Ideally, use `openai.chat.completions.create({...})` here.

    // MOCK LLM CALL
    const mockAIResponse = {
        summary: `${leadDetails.name} de ${leadDetails.company_name || 'empresa desconhecida'} é um prospecto de $${leadDetails.value}.`,
        next_action: "Faça acompanhamento das atividades recentes e verifique suas necessidades específicas.",
        follow_up_email: `Olá ${leadDetails.name.split(' ')[0]},\n\nEspero que você esteja bem. Gostaria de retomar nosso último contato. Você ainda tem interesse em nossa solução?\n\nAtenciosamente,`
    }

    // 6. Save to cache
    await (supabase as any).from('ai_outputs').insert({
        company_id: companyId,
        lead_id: leadId,
        input_hash: inputHash,
        output_data: mockAIResponse
    })

    return NextResponse.json({ data: mockAIResponse, cached: false })
}
