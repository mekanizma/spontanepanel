import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id gerekli' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()

    const { error } = await supabase
      .from('user_badges')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Rozet kaldırma hatası:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Rozet kaldırma genel hatası:', e)
    return NextResponse.json({ error: 'Rozet kaldırılırken hata oluştu' }, { status: 500 })
  }
}



