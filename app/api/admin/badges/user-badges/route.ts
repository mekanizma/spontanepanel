import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient()
    
    console.log('🔍 User badges tablosunu sorgula...')
    
    // Test API gibi basit query
    const { data, error, count } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact' })
    
    if (error) {
      console.error('⚠️ User badges hatası:', error)
      return NextResponse.json({ userBadges: [] })
    }

    const rows = data || []
    console.log('📊 User badges raw data:', rows.length, 'kayıt (count:', count, ')')
    
    if (rows.length === 0) {
      console.log('⚠️ User badges tablosu boş')
      return NextResponse.json({ userBadges: [] })
    }
    
    console.log('✅ Data alındı, ilk kayıt:', rows[0])

    // İlk row'dan kolon isimlerini öğren
    const firstRow = rows[0]
    const actualColumns = Object.keys(firstRow)
    console.log('📋 User badges kolonları:', actualColumns)
    console.log('📋 İlk row örneği:', JSON.stringify(firstRow, null, 2))

    // Kolon isimlerini normalize et
    const getUserId = (r: any) => r.user_id ?? r.userId ?? r.userid ?? null
    const getBadgeId = (r: any) => {
      // Tüm olası badge kolon isimlerini dene
      return r.badge_id ?? r.badgeId ?? r.badgeID ?? r.badge ?? r.badges_id ?? null
    }
    
    console.log('🔍 Normalize edilmiş ilk row:', {
      user_id: getUserId(firstRow),
      badge_id: getBadgeId(firstRow)
    })

    const normalizedRows = rows.map(r => ({
      ...r,
      user_id: getUserId(r),
      badge_id: getBadgeId(r),
    }))

    const userIds = Array.from(new Set(normalizedRows.map(r => r.user_id))).filter(Boolean)
    const badgeIds = Array.from(new Set(normalizedRows.map(r => r.badge_id))).filter(Boolean)
    
    console.log('📊 User IDs:', userIds.length, 'Badge IDs:', badgeIds.length)

    console.log('🔍 User IDs:', userIds)
    console.log('🔍 Badge IDs:', badgeIds)
    
    const [usersRes, badgesRes] = await Promise.all([
      userIds.length ? supabase.from('users').select('id,username,email,full_name,profile_image_url').in('id', userIds) : Promise.resolve({ data: [], error: null } as any),
      badgeIds.length ? supabase.from('badges').select('id,name,description,icon_url,color,created_at').in('id', badgeIds) : Promise.resolve({ data: [], error: null } as any),
    ])
    
    console.log('👥 Users çekildi:', usersRes.data?.length || 0)
    console.log('🏆 Badges çekildi:', badgesRes.data?.length || 0)

    if (usersRes.error) {
      console.log('⚠️ Users hatası:', usersRes.error.message)
    }
    if (badgesRes.error) {
      console.log('⚠️ Badges hatası:', badgesRes.error.message)
    }

    const userMap = new Map((usersRes.data || []).map((u: any) => [u.id, u]))
    const badgeMap = new Map((badgesRes.data || []).map((b: any) => [b.id, b]))

    console.log('🗺️ User Map:', userMap.size, 'badge Map:', badgeMap.size)

    const enriched = normalizedRows.map(r => {
      const user = userMap.get(r.user_id)
      const badge = badgeMap.get(r.badge_id)
      
      console.log('🔄 Processing row:', {
        user_id: r.user_id,
        badge_id: r.badge_id,
        hasUser: !!user,
        hasBadge: !!badge
      })
      
      return {
        id: r.id,
        user_id: r.user_id,
        badge_id: r.badge_id,
        assigned_at: r.assigned_at || r.assignedAt || r.created_at || r.createdAt || r.created_at || null,
        users: user ? [user] : [],
        badges: badge ? [badge] : [],
      }
    })
    
    console.log('✅ Enriched data:', enriched.length)

    return NextResponse.json({ userBadges: enriched })
  } catch (e) {
    // Herhangi bir hata durumunda boş array döndür
    console.log('❌ User badges genel hatası:', e)
    return NextResponse.json({ userBadges: [] })
  }
}


