import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId zorunludur' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()
    const { error } = await supabase
      .from('users')
      .update({ is_premium: false, premium_expires_at: null })
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


