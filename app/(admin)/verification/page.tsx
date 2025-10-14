import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getPendingVerifications() {
  const supabase = await getServerSupabase()
  const { data } = await supabase
    .from('user_verification')
    .select(`
      id,
      user_id,
      verification_type,
      is_verified,
      created_at,
      verification_image_url,
      users!user_id (
        username,
        full_name,
        profile_image_url
      )
    `)
    .eq('is_verified', false)
    .order('created_at', { ascending: true })
  return data || []
}

export default async function VerificationPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/verification')
  }
  
  const items = await getPendingVerifications()

  async function approve(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('user_verification').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', id)
    // Kullanıcıyı doğrulanmış olarak işaretle
    const { data: verification } = await supabase.from('user_verification').select('user_id').eq('id', id).single()
    if (verification) {
      await supabase.from('users').update({ is_verified: true }).eq('id', verification.user_id)
    }
  }

  async function reject(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('user_verification').delete().eq('id', id)
  }

  return (
    <main>
      <h1>Doğrulama Yönetimi</h1>
      
      <div className="card mt-6">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Doğrulama Türü</th>
                <th>Doğrulama Fotoğrafı</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v: any) => (
                <tr key={v.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {v.users?.profile_image_url ? (
                          <img 
                            src={v.users.profile_image_url} 
                            alt={v.users.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold">
                            {v.users?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{v.users?.full_name || v.users?.username}</div>
                        <div className="text-sm text-muted">@{v.users?.username}</div>
                        <div className="text-xs text-muted">ID: {v.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {v.verification_type}
                    </span>
                  </td>
                  <td>
                    {v.verification_image_url ? (
                      <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src={v.verification_image_url} 
                          alt="Doğrulama fotoğrafı"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => window.open(v.verification_image_url, '_blank')}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Fotoğraf Yok</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {v.is_verified ? (
                      <span className="badge badge-success">Doğrulandı</span>
                    ) : (
                      <span className="badge badge-warning">Bekliyor</span>
                    )}
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(v.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <form action={approve}>
                        <input type="hidden" name="id" value={v.id} />
                        <button type="submit" className="btn btn-success btn-sm">
                          Onayla
                        </button>
                      </form>
                      <form action={reject}>
                        <input type="hidden" name="id" value={v.id} />
                        <button 
                          type="submit" 
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            if (!confirm('Bu doğrulama başvurusunu reddetmek istediğinizden emin misiniz?')) {
                              e.preventDefault()
                            }
                          }}
                        >
                          Reddet
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




