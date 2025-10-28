import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const onlyPremium = url.searchParams.get('premium') === 'true'
    const supabase = createServiceSupabaseClient()

    let query = supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        full_name,
        created_at,
        is_premium,
        is_verified,
        status,
        premium_expires_at,
        profile_image_url
      `)
    if (onlyPremium) {
      // Premium üye: is_premium=true VE (premium_expires_at null ya da gelecekte)
      query = query
        .eq('is_premium', true)
        .or('premium_expires_at.is.null,premium_expires_at.gt.now()')
    }
    const { data: users, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const usersWithEventCounts = await Promise.all(
      (users || []).map(async (user) => {
        const { count } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id)

        return { ...user, event_count: count || 0 }
      })
    )

    return NextResponse.json({ users: usersWithEventCounts })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const userId = url.searchParams.get('id')
    const supabase = createServiceSupabaseClient()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing action or id' }, { status: 400 })
    }

    let result
    switch (action) {
      case 'suspend':
        result = await supabase.from('users').update({ status: 'suspended' }).eq('id', userId)
        break
      case 'unsuspend':
        result = await supabase.from('users').update({ status: 'active' }).eq('id', userId)
        break
      case 'delete':
        result = await supabase.from('users').delete().eq('id', userId)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


