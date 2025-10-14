import { createServiceSupabaseClient } from '@/lib/supabaseService'

interface VerificationRequest {
  id: string
  user_id: string
  verification_type: string
  verification_data: any
  is_verified: boolean
  created_at: string
  verified_at: string | null
  users: {
    username: string
    full_name: string
    profile_image_url: string | null
  }[] | null
}

async function getVerificationRequests(): Promise<VerificationRequest[]> {
  console.log('✅ Verification Requests yükleniyor...')
  
  const supabase = createServiceSupabaseClient()

  try {
    console.log('✅ Verification Requests tablosundan veri çekiliyor...')
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
          profile_image_url
        )
      `)
      .order('created_at', { ascending: false })

    console.log('✅ Verification Requests sonucu:', { count: requests?.length, error })

    if (error) {
      console.error('Doğrulama istekleri yüklenirken hata:', error)
      throw new Error('Doğrulama istekleri yüklenirken hata oluştu')
    }

    return requests || []
  } catch (error) {
    console.error('Doğrulama istekleri yüklenirken genel hata:', error)
    throw new Error('Doğrulama istekleri yüklenirken hata oluştu')
  }
}

export default async function VerificationPage() {
  let requests: VerificationRequest[]
  let error: string | null = null

  try {
    requests = await getVerificationRequests()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Bilinmeyen hata'
    requests = []
  }

  if (error) {
    return (
      <main>
        <h1>Doğrulama Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Doğrulama Yönetimi</h1>
      
      <div className="card mt-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold mb-2">Doğrulama Sistemi</h3>
          <p className="text-muted mb-4">
            Kullanıcı doğrulama isteklerini onaylama özelliği burada olacak.
          </p>
          <div className="text-sm text-muted">
            Bu özellik yakında eklenecek.
          </div>
        </div>
      </div>
      
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Doğrulama İstekleri</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Doğrulama Türü</th>
                <th>Veri</th>
                <th>Durum</th>
                <th>İstek Tarihi</th>
                <th>Doğrulama Tarihi</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {request.users?.[0]?.profile_image_url ? (
                          <img 
                            src={request.users[0].profile_image_url} 
                            alt={request.users[0].username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {request.users?.[0]?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{request.users?.[0]?.full_name || request.users?.[0]?.username}</div>
                        <div className="text-sm text-muted">@{request.users?.[0]?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{request.verification_type}</span>
                  </td>
                  <td>
                    <div className="text-sm text-muted">
                      {JSON.stringify(request.verification_data)}
                    </div>
                  </td>
                  <td>
                    {request.is_verified ? (
                      <span className="badge badge-success">Doğrulandı</span>
                    ) : (
                      <span className="badge badge-warning">Bekliyor</span>
                    )}
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(request.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {request.verified_at ? 
                        new Date(request.verified_at).toLocaleDateString('tr-TR') : 
                        '-'
                      }
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-muted">
                      {request.is_verified ? 'Doğrulandı' : 'Bekliyor'}
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