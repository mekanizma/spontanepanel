import { createServiceSupabaseClient } from '@/lib/supabaseService'

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

async function getReports(): Promise<Report[]> {
  console.log('⚠️ Reports yükleniyor...')
  
  const supabase = createServiceSupabaseClient()

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
      // Reports tablosu yoksa boş array döndür
      if (error.code === 'PGRST205') {
        console.log('⚠️ Reports tablosu bulunamadı, boş array döndürülüyor')
        return []
      }
      throw new Error('Şikayetler yüklenirken hata oluştu')
    }

    return reports || []
  } catch (error) {
    console.error('Şikayetler yüklenirken genel hata:', error)
    // Reports tablosu yoksa boş array döndür
    if (error instanceof Error && error.message.includes('PGRST205')) {
      console.log('⚠️ Reports tablosu bulunamadı, boş array döndürülüyor')
      return []
    }
    throw new Error('Şikayetler yüklenirken hata oluştu')
  }
}

export default async function ReportsPage() {
  let reports: Report[]
  let error: string | null = null

  try {
    reports = await getReports()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Bilinmeyen hata'
    reports = []
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
                    <div className="text-sm text-muted">
                      {report.status === 'pending' ? 'Bekliyor' : 
                       report.status === 'resolved' ? 'Çözüldü' : 'Reddedildi'}
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