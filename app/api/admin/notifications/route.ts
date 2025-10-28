import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient()

    // Önce temel bildirim kayıtlarını çek
    const base = await supabase
      .from('notifications')
      .select('id,user_id,title,message,type,is_read,created_at')
      .order('created_at', { ascending: false })

    if (base.error) {
      if (typeof base.error.message === 'string' && base.error.message.includes('schema cache')) {
        return NextResponse.json({ notifications: [] })
      }
      return NextResponse.json({ error: base.error.message }, { status: 400 })
    }

    const rows = base.data || []
    if (rows.length === 0) return NextResponse.json({ notifications: [] })

    const userIds = Array.from(new Set(rows.map((r: any) => r.user_id))).filter(Boolean)
    const usersRes = userIds.length
      ? await supabase.from('users').select('id,username,full_name,email,profile_image_url').in('id', userIds)
      : { data: [], error: null } as any

    if (usersRes.error && !(typeof usersRes.error.message === 'string' && usersRes.error.message.includes('schema cache'))) {
      return NextResponse.json({ error: usersRes.error.message }, { status: 400 })
    }

    const userMap = new Map((usersRes.data || []).map((u: any) => [u.id, u]))
    const enriched = rows.map((n: any) => ({
      ...n,
      users: userMap.get(n.user_id) || null,
    }))

    return NextResponse.json({ notifications: enriched })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


