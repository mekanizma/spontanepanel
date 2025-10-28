import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function POST(request: Request) {
  try {
    const { requestId } = await request.json()
    if (!requestId) {
      return NextResponse.json({ error: 'requestId zorunludur' }, { status: 400 })
    }

    console.log('🔍 Reddetme isteği alındı:', { requestId })

    const supabase = createServiceSupabaseClient()
    
    // Önce user_verification kaydını al ve user_id'yi bul
    const { data: verification } = await supabase
      .from('user_verification')
      .select('user_id')
      .eq('id', requestId)
      .single()

    // user_verification kaydını sil
    const { error } = await supabase
      .from('user_verification')
      .delete()
      .eq('id', requestId)

    if (error) {
      console.error('❌ Doğrulama reddedilirken hata:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Kullanıcının users tablosundaki is_verified durumunu false yap
    if (verification) {
      const { error: userError } = await supabase
        .from('users')
        .update({ is_verified: false })
        .eq('id', verification.user_id)

      if (userError) {
        console.error('❌ Kullanıcı durumu güncellenirken hata:', userError)
        // Bu hata kritik değil, devam ediyoruz
      }
    }

    console.log('✅ Doğrulama başarıyla reddedildi')
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.error('❌ Genel hata:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


