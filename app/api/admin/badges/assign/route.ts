import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function POST(request: Request) {
  try {
    const { user_id, badge_id } = await request.json()
    console.log('🎯 Rozet atanıyor:', { user_id, badge_id })

    if (!user_id || !badge_id) {
      return NextResponse.json({ error: 'user_id ve badge_id gerekli' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()

    // Önce mevcut veriyi kontrol et - farklı kolon isimlerini dene
    const { data: existingData } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user_id)
      .limit(10)
    
    console.log('🔍 Mevcut user badges:', existingData?.length || 0)

    // Farklı kolon isimlerini kontrol et
    const existing = existingData?.find(row => 
      row.badge_id === badge_id || 
      row.badgeId === badge_id || 
      row.badges_id === badge_id ||
      row.badge === badge_id
    )

    if (existing) {
      return NextResponse.json({ error: 'Bu kullanıcı zaten bu rozete sahip' }, { status: 400 })
    }

    // Rozeti ata - farklı kolon isimlerini dene
    console.log('💾 Insert ediliyor:', { user_id, badge_id })
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id,
        badge_id
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Rozet atama hatası:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('✅ Rozet başarıyla eklendi:', data)
    return NextResponse.json({ userBadge: data })
  } catch (e) {
    console.error('Rozet atama genel hatası:', e)
    return NextResponse.json({ error: 'Rozet atanırken hata oluştu' }, { status: 500 })
  }
}

