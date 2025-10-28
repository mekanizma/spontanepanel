import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { title, message, type = 'announcement' } = body
    if (!title || !message) {
      return NextResponse.json({ error: 'title ve message zorunludur' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()
    const usersRes = await supabase.from('users').select('id')
    if (usersRes.error) {
      if (typeof usersRes.error.message === 'string' && usersRes.error.message.includes('schema cache')) {
        return NextResponse.json({ sent: 0 })
      }
      return NextResponse.json({ error: usersRes.error.message }, { status: 400 })
    }
    const users = usersRes.data || []
    if (users.length === 0) return NextResponse.json({ sent: 0 })

    const inserts = users.map((u: any) => ({ user_id: u.id, title, message, type, is_read: false }))
    const insertRes = await supabase.from('notifications').insert(inserts)
    if (insertRes.error) {
      return NextResponse.json({ error: insertRes.error.message }, { status: 400 })
    }
    return NextResponse.json({ sent: users.length })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


