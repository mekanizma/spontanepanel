import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient()

    const { data, error } = await supabase
      .from('user_verification')
      .select(`
        id,
        user_id,
        verification_type,
        verification_data,
        is_verified,
        created_at,
        verified_at,
        users:users!user_id (
          username,
          email,
          full_name,
          profile_image_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10000)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ requests: data || [] })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


