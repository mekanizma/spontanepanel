import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getReports() {
  const supabase = await getServerSupabase()

  try {
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

    if (error) {
      console.error('Şikayetler yüklenirken hata:', error)
      return []
    }

    return reports || []
  } catch (error) {
    console.error('Şikayetler yüklenirken genel hata:', error)
    return []
  }
}

export default async function ReportsPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/reports')
  }
  
  const reports = await getReports()

  async function resolveReport(formData: FormData) {
    'use server'
    try {
      const reportId = String(formData.get('reportId'))
      const supabase = await getServerSupabase()
      const { error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId)
      
      if (error) {
        console.error('Şikayet çözülürken hata:', error)
      }
    } catch (error) {
      console.error('Şikayet çözülürken genel hata:', error)
    }
  }

  async function dismissReport(formData: FormData) {
    'use server'
    try {
      const reportId = String(formData.get('reportId'))
      const supabase = await getServerSupabase()
      const { error } = await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId)
      
      if (error) {
        console.error('Şikayet reddedilirken hata:', error)
      }
    } catch (error) {
      console.error('Şikayet reddedilirken genel hata:', error)
    }
  }

  return (
    <main>
      <h1>Şikayet Yönetimi</h1>
      
      {reports.length === 0 ? (
        <div className="card mt-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Henüz şikayet bulunmuyor</h3>
            <p className="text-muted">Kullanıcılar tarafından yapılan şikayetler burada görünecek.</p>
          </div>
        </div>
      ) : (
        <div className="card mt-6">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Şikayet Eden</th>
                  <th>Sebep</th>
                  <th>Açıklama</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: any) => (
                  <tr key={report.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {report.users?.profile_image_url ? (
                            <img 
                              src={report.users.profile_image_url} 
                              alt={report.users.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {report.users?.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{report.users?.full_name || report.users?.username}</div>
                          <div className="text-sm text-muted">@{report.users?.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{report.reason || 'Belirtilmemiş'}</div>
                    </td>
                    <td>
                      <div className="text-sm max-w-xs line-clamp-2">
                        {report.description || 'Açıklama yok'}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {new Date(report.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {report.status === 'pending' && (
                          <span className="badge badge-warning">Bekliyor</span>
                        )}
                        {report.status === 'resolved' && (
                          <span className="badge badge-success">Çözüldü</span>
                        )}
                        {report.status === 'dismissed' && (
                          <span className="badge badge-error">Reddedildi</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {report.status === 'pending' && (
                          <>
                            <form action={resolveReport}>
                              <input type="hidden" name="reportId" value={report.id} />
                              <button type="submit" className="btn btn-success btn-sm">
                                Çöz
                              </button>
                            </form>
                            <form action={dismissReport}>
                              <input type="hidden" name="reportId" value={report.id} />
                              <button type="submit" className="btn btn-danger btn-sm">
                                Reddet
                              </button>
                            </form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}