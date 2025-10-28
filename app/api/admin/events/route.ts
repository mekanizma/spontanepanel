import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, eventId } = body
    
    const supabase = createServiceSupabaseClient()

    if (!eventId || !action) {
      return NextResponse.json({ error: 'Missing eventId or action' }, { status: 400 })
    }

    let result
    switch (action) {
      case 'close':
        result = await supabase.from('events').update({ status: 'inactive' }).eq('id', eventId)
        break
      case 'open':
        result = await supabase.from('events').update({ status: 'approved' }).eq('id', eventId)
        break
      case 'delete':
        result = await supabase.from('events').delete().eq('id', eventId)
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

