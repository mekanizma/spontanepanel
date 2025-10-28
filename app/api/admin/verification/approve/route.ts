import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function POST(request: Request) {
  try {
    const { requestId } = await request.json()
    if (!requestId) {
      return NextResponse.json({ error: 'requestId zorunludur' }, { status: 400 })
    }

    console.log('🔍 Onaylama isteği alındı:', { requestId })

    const supabase = createServiceSupabaseClient()

    // Önce user_verification kaydını al ve user_id'yi bul
    const { data: verification, error: fetchError } = await supabase
      .from('user_verification')
      .select('user_id')
      .eq('id', requestId)
      .single()

    if (fetchError || !verification) {
      console.error('❌ Doğrulama kaydı bulunamadı:', fetchError)
      return NextResponse.json({ error: 'Doğrulama kaydı bulunamadı' }, { status: 400 })
    }

    const nowIso = new Date().toISOString()
    console.log('⏰ Doğrulama tarihi:', nowIso)

    // user_verification tablosunu güncelle
    const { data: updatedVerification, error: verificationError } = await supabase
      .from('user_verification')
      .update({ is_verified: true, verified_at: nowIso })
      .eq('id', requestId)
      .select()

    if (verificationError) {
      console.error('❌ Doğrulama onaylama hatası:', verificationError)
      return NextResponse.json({ error: verificationError.message }, { status: 400 })
    }

    // users tablosundaki is_verified ve status alanlarını da güncelle
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        is_verified: true,
        status: 'active' 
      })
      .eq('id', verification.user_id)

    if (userError) {
      console.error('❌ Kullanıcı doğrulama durumu güncellenirken hata:', userError)
      // Bu hata kritik değil, devam ediyoruz
    }

    // Kullanıcıya bildirim gönder
    try {
      // Türkçe bildirim
      const { error: trNotificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: verification.user_id,
          type: 'verification_approved',
          title: 'Hesabınız Onaylandı ✓',
          message: 'Tebrikler! Hesabınız onaylandı. Artık etkinliklere katılabilir ve etkinlik oluşturabilirsiniz.',
          data: { verification_id: requestId },
          created_at: nowIso,
          read_at: null
        })

      if (trNotificationError) {
        console.error('❌ Türkçe bildirim gönderilemedi:', trNotificationError)
      }

      // İngilizce bildirim
      const { error: enNotificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: verification.user_id,
          type: 'verification_approved',
          title: 'Your Account Has Been Approved ✓',
          message: 'Congratulations! Your account has been approved. You can now participate in events and create events.',
          data: { verification_id: requestId },
          created_at: nowIso,
          read_at: null
        })

      if (enNotificationError) {
        console.error('❌ İngilizce bildirim gönderilemedi:', enNotificationError)
      }

      console.log('✅ Bildirimler başarıyla gönderildi')
    } catch (notificationError) {
      console.error('❌ Bildirim gönderme hatası:', notificationError)
      // Bildirim hatası kritik değil, devam ediyoruz
    }

    console.log('✅ Doğrulama başarıyla onaylandı:', updatedVerification)
    return NextResponse.json({ ok: true, data: updatedVerification })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.error('❌ Genel hata:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


