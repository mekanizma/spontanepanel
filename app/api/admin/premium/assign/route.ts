import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function POST(request: Request) {
  try {
    const { userId, expiresAt } = await request.json()
    if (!userId || !expiresAt) {
      return NextResponse.json({ error: 'userId ve expiresAt zorunludur' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()
    const { error } = await supabase
      .from('users')
      .update({ is_premium: true, premium_expires_at: expiresAt })
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


