'use client'

import { useEffect, useState } from 'react'

interface Report {
  id: string
  reporter_id: string
  reported_user_id: string | null
  reported_event_id: string | null
  reason: string
  description: string
  status: string
  created_at: string
  users: {
    username: string
    full_name: string
    profile_image_url: string | null
  }[] | null
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReports() {
      console.log('⚠️ Reports yükleniyor...')
      
      // Environment variables kullan
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      try {
        console.log('⚠️ Reports tablosundan veri çekiliyor...')
        // Reports tablosu yoksa boş array döndür
        const { data: reports, error } = await supabase
          .from('reports')
          .select(`
            id,
            reporter_id,
            reported_user_id,
            reported_event_id,
            reason,
            description,
            status,
            created_at,
            users!reporter_id (
              username,
              full_name,
              profile_image_url
            )
          `)
          .order('created_at', { ascending: false })

        console.log('⚠️ Reports sonucu:', { count: reports?.length, error })

        if (error) {
          console.error('Şikayetler yüklenirken hata:', error)
          setError('Şikayetler yüklenirken hata oluştu')
          setLoading(false)
          return
        }

        setReports(reports || [])
        setLoading(false)
      } catch (error) {
        console.error('Şikayetler yüklenirken genel hata:', error)
        setError('Şikayetler yüklenirken hata oluştu')
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  async function resolveReport(reportId: string) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', reportId)
      
      if (error) {
        console.error('Şikayet çözüldü olarak işaretlenirken hata:', error)
        return
      }
      
      // UI'yi güncelle
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: 'resolved' } : report
      ))
    } catch (error) {
      console.error('Şikayet çözüldü olarak işaretlenirken genel hata:', error)
    }
  }

  async function deleteReport(reportId: string) {
    if (!confirm('Bu şikayeti silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
      
      if (error) {
        console.error('Şikayet silinirken hata:', error)
        return
      }
      
      // UI'den kaldır
      setReports(reports.filter(report => report.id !== reportId))
    } catch (error) {
      console.error('Şikayet silinirken genel hata:', error)
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Şikayet Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Şikayetler yükleniyor...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Şikayet Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Şikayet Yönetimi</h1>
      
      <div className="card mt-6">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Şikayet Eden</th>
                <th>Şikayet Türü</th>
                <th>Sebep</th>
                <th>Açıklama</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {report.users?.[0]?.profile_image_url ? (
                          <img 
                            src={report.users[0].profile_image_url} 
                            alt={report.users[0].username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {report.users?.[0]?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{report.users?.[0]?.full_name || report.users?.[0]?.username}</div>
                        <div className="text-sm text-muted">@{report.users?.[0]?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {report.reported_user_id ? 'Kullanıcı' : 'Etkinlik'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-warning">{report.reason}</span>
                  </td>
                  <td>
                    <div className="text-sm text-muted line-clamp-2">
                      {report.description}
                    </div>
                  </td>
                  <td>
                    {report.status === 'pending' && (
                      <span className="badge badge-warning">Bekliyor</span>
                    )}
                    {report.status === 'resolved' && (
                      <span className="badge badge-success">Çözüldü</span>
                    )}
                    {report.status === 'rejected' && (
                      <span className="badge badge-error">Reddedildi</span>
                    )}
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(report.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {report.status === 'pending' && (
                        <button 
                          onClick={() => resolveReport(report.id)}
                          className="btn btn-success btn-sm"
                        >
                          Çözüldü İşaretle
                        </button>
                      )}
                      
                      <button 
                        onClick={() => deleteReport(report.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}