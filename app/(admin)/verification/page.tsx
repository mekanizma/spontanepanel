import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getVerificationRequests() {
  const supabase = await getServerSupabase()

  try {
    const { data: requests, error } = await supabase
      .from('user_verification')
      .select(`
        id,
        user_id,
        verification_type,
        verification_data,
        is_verified,
        created_at,
        verified_at,
        users!user_id (
          username,
          full_name,
          email,
          profile_image_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Doğrulama istekleri yüklenirken hata:', error)
      return []
    }

    return requests || []
  } catch (error) {
    console.error('Doğrulama istekleri yüklenirken genel hata:', error)
    return []
  }
}

export default async function VerificationPage() {
  // Geçici olarak auth kontrolünü devre dışı bırak
  // const supabase = await getServerSupabase()
  // const { data } = await supabase.auth.getUser()
  // if (!data.user) {
  //   redirect('/login?redirect=/verification')
  // }
  
  const requests = await getVerificationRequests()

  async function approveVerification(formData: FormData) {
    'use server'
    try {
      const requestId = String(formData.get('requestId'))
      const supabase = await getServerSupabase()
      
      // Doğrulama isteğini onayla
      const { error: verificationError } = await supabase
        .from('user_verification')
        .update({ 
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (verificationError) {
        console.error('Doğrulama onaylanırken hata:', verificationError)
        return
      }

      // Kullanıcının doğrulanmış durumunu güncelle
      const { data: verification } = await supabase
        .from('user_verification')
        .select('user_id')
        .eq('id', requestId)
        .single()

      if (verification) {
        const { error: userError } = await supabase
          .from('users')
          .update({ is_verified: true })
          .eq('id', verification.user_id)

        if (userError) {
          console.error('Kullanıcı doğrulama durumu güncellenirken hata:', userError)
        }
      }
    } catch (error) {
      console.error('Doğrulama onaylanırken genel hata:', error)
    }
  }

  async function rejectVerification(formData: FormData) {
    'use server'
    try {
      const requestId = String(formData.get('requestId'))
      const supabase = await getServerSupabase()
      
      const { error } = await supabase
        .from('user_verification')
        .update({ 
          is_verified: false,
          verified_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) {
        console.error('Doğrulama reddedilirken hata:', error)
      }
    } catch (error) {
      console.error('Doğrulama reddedilirken genel hata:', error)
    }
  }

  return (
    <main>
      <h1>Doğrulama Yönetimi</h1>
      
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Doğrulama İstekleri</h2>
        
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Henüz doğrulama isteği yok</h3>
            <p className="text-muted">Kullanıcıların doğrulama istekleri burada görünecek.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request: any) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {request.users?.profile_image_url ? (
                          <img 
                            src={request.users.profile_image_url} 
                            alt={request.users.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold">
                            {request.users?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{request.users?.full_name || request.users?.username}</div>
                        <div className="text-sm text-muted">@{request.users?.username}</div>
                        <div className="text-xs text-muted">{request.users?.email}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="text-sm font-medium text-muted">Doğrulama Türü</label>
                        <div className="text-sm">{request.verification_type}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted">Durum</label>
                        <div>
                          {request.is_verified ? (
                            <span className="badge badge-success">Onaylandı</span>
                          ) : (
                            <span className="badge badge-warning">Bekliyor</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {request.verification_data && (
                      <div className="mb-3">
                        <label className="text-sm font-medium text-muted">Doğrulama Verileri</label>
                        <div className="text-sm bg-gray-50 p-2 rounded mt-1">
                          <pre className="whitespace-pre-wrap text-xs">
                            {JSON.stringify(request.verification_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted">
                      İstek Tarihi: {new Date(request.created_at).toLocaleString('tr-TR')}
                      {request.verified_at && (
                        <span className="ml-4">
                          Onay Tarihi: {new Date(request.verified_at).toLocaleString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!request.is_verified && (
                      <>
                        <form action={approveVerification}>
                          <input type="hidden" name="requestId" value={request.id} />
                          <button type="submit" className="btn btn-success btn-sm">
                            Onayla
                          </button>
                        </form>
                        <form action={rejectVerification}>
                          <input type="hidden" name="requestId" value={request.id} />
                          <button type="submit" className="btn btn-danger btn-sm">
                            Reddet
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}