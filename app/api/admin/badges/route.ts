import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient()
    const { data, error } = await supabase
      .from('badges')
      .select('id,name,description,icon_url,color,created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.log('⚠️ Badges hatası:', error.message)
      return NextResponse.json({ badges: [] })
    }
    
    const badges = data || []
    console.log('📊 Veritabanından çekilen rozet sayısı:', badges.length)
    
    // ID'ye göre unique yap (gerçek duplicate varsa)
    const uniqueBadges = Array.from(
      new Map(badges.map(badge => [badge.id, badge])).values()
    )
    
    console.log('📊 Unique badges:', uniqueBadges.length)
    console.log('📋 Rozet isimleri:', uniqueBadges.map(b => b.name))
    
    return NextResponse.json({ badges: uniqueBadges })
  } catch (e) {
    console.log('❌ Badges genel hatası:', e)
    return NextResponse.json({ badges: [] })
  }
}


