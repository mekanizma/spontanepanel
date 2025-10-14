import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getReports() {
  const supabase = await getServerSupabase()
  
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id,
      reporter_id,
      reported_user_id,
      report_type,
      description,
      status,
      created_at,
      reporter:reporter_id (
        username,
        full_name,
        profile_image_url
      ),
      reported_user:reported_user_id (
        username,
        full_name,
        profile_image_url
      )
    `)
    .order('created_at', { ascending: false })

  return reports || []
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
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', id)
  }

  async function blockUser(formData: FormData) {
    'use server'
    const reportedUserId = String(formData.get('reportedUserId'))
    const supabase = await getServerSupabase()
    await supabase.from('users').update({ is_suspended: true }).eq('id', reportedUserId)
  }

  async function deleteReport(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('reports').delete().eq('id', id)
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
                <th>Şikayet Edilen</th>
                <th>Tür</th>
                <th>Açıklama</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report: any) => (
                <tr key={report.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {report.reporter?.profile_image_url ? (
                          <img 
                            src={report.reporter.profile_image_url} 
                            alt={report.reporter.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {report.reporter?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{report.reporter?.full_name || report.reporter?.username}</div>
                        <div className="text-sm text-muted">@{report.reporter?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {report.reported_user?.profile_image_url ? (
                          <img 
                            src={report.reported_user.profile_image_url} 
                            alt={report.reported_user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {report.reported_user?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{report.reported_user?.full_name || report.reported_user?.username}</div>
                        <div className="text-sm text-muted">@{report.reported_user?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-warning">
                      {report.report_type}
                    </span>
                  </td>
                  <td>
                    <div className="max-w-xs">
                      <p className="text-sm line-clamp-3">
                        {report.description}
                      </p>
                    </div>
                  </td>
                  <td>
                    {report.status === 'pending' && (
                      <span className="badge badge-warning">Bekliyor</span>
                    )}
                    {report.status === 'resolved' && (
                      <span className="badge badge-success">Çözüldü</span>
                    )}
                    {report.status === 'dismissed' && (
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
                        <>
                          <form action={resolveReport}>
                            <input type="hidden" name="id" value={report.id} />
                            <button type="submit" className="btn btn-success btn-sm">
                              Çözüldü
                            </button>
                          </form>
                          
                          <form action={blockUser}>
                            <input type="hidden" name="reportedUserId" value={report.reported_user_id} />
                            <button 
                              type="submit" 
                              className="btn btn-danger btn-sm"
                              onClick={(e) => {
                                if (!confirm('Bu kullanıcıyı bloklamak istediğinizden emin misiniz?')) {
                                  e.preventDefault()
                                }
                              }}
                            >
                              Kullanıcıyı Blokla
                            </button>
                          </form>
                        </>
                      )}
                      
                      <form action={deleteReport}>
                        <input type="hidden" name="id" value={report.id} />
                        <button 
                          type="submit" 
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            if (!confirm('Bu şikayeti silmek istediğinizden emin misiniz?')) {
                              e.preventDefault()
                            }
                          }}
                        >
                          Sil
                        </button>
                      </form>
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
