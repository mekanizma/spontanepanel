'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

interface Stats {
  totalUsers: number
  totalEvents: number
  pendingEvents: number
  pendingReports: number
  premiumUsers: number
  verifiedUsers: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalEvents: 0,
    pendingEvents: 0,
    pendingReports: 0,
    premiumUsers: 0,
    verifiedUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      console.log('📊 Dashboard stats yükleniyor...')
      const supabase = createClientComponentClient()

      try {
        console.log('📊 Users tablosundan veri çekiliyor...')
        const { count: totalUsers, error: usersError } = await supabase.from('users').select('*', { count: 'exact', head: true })
        console.log('📊 Users sonucu:', { count: totalUsers, error: usersError })
        
        console.log('📊 Events tablosundan veri çekiliyor...')
        const { count: totalEvents, error: eventsError } = await supabase.from('events').select('*', { count: 'exact', head: true })
        console.log('📊 Events sonucu:', { count: totalEvents, error: eventsError })

        const { count: pendingEvents } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        // Reports tablosu yoksa 0 döndür
        let pendingReports = 0
        try {
          const { count } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
          pendingReports = count || 0
        } catch {
          console.log('Reports tablosu bulunamadı, 0 olarak ayarlandı')
        }

        const { count: premiumUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_premium', true)

        const { count: verifiedUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', true)

        setStats({ 
          totalUsers: totalUsers || 0, 
          totalEvents: totalEvents || 0, 
          pendingEvents: pendingEvents || 0, 
          pendingReports: pendingReports || 0,
          premiumUsers: premiumUsers || 0,
          verifiedUsers: verifiedUsers || 0
        })
        setLoading(false)
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error)
        setError('Veriler yüklenirken hata oluştu')
        setLoading(false)
      }
    }

    loadStats()
  }, [])
  
  if (loading) {
    return (
      <main>
        <h1>Dashboard</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Veriler yükleniyor...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Dashboard</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        <StatCard 
          title="Toplam Kullanıcı" 
          value={stats.totalUsers} 
          icon="👥"
          color="blue"
        />
        <StatCard 
          title="Toplam Etkinlik" 
          value={stats.totalEvents} 
          icon="🎉"
          color="green"
        />
        <StatCard 
          title="Bekleyen Etkinlik" 
          value={stats.pendingEvents} 
          icon="⏳"
          color="yellow"
        />
        <StatCard 
          title="Bekleyen Şikayet" 
          value={stats.pendingReports} 
          icon="⚠️"
          color="red"
        />
        <StatCard 
          title="Premium Kullanıcı" 
          value={stats.premiumUsers} 
          icon="⭐"
          color="purple"
        />
        <StatCard 
          title="Doğrulanmış Kullanıcı" 
          value={stats.verifiedUsers} 
          icon="✅"
          color="green"
        />
      </div>
    </main>
  )
}

function StatCard({ title, value, icon, color }: { 
  title: string; 
  value: number; 
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
    purple: 'border-purple-200 bg-purple-50'
  }

  return (
    <div className={`card border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold">{value.toLocaleString()}</span>
      </div>
      <div className="text-sm text-muted font-medium">{title}</div>
    </div>
  )
}


