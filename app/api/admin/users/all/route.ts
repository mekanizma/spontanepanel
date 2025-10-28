import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient()

    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        full_name,
        is_premium,
        profile_image_url
      `)
      .order('username', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


