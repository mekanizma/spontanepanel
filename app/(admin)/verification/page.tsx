'use client'

import { useEffect, useState } from 'react'

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

export default function VerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVerificationRequests() {
      console.log('✅ Verification Requests yükleniyor...')
      
      // Environment variables kullan
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

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
          setError('Doğrulama istekleri yüklenirken hata oluştu')
          setLoading(false)
          return
        }

        setRequests(requests || [])
        setLoading(false)
      } catch (error) {
        console.error('Doğrulama istekleri yüklenirken genel hata:', error)
        setError('Doğrulama istekleri yüklenirken hata oluştu')
        setLoading(false)
      }
    }

    loadVerificationRequests()
  }, [])

  async function approveVerification(requestId: string) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Önce verification request'i onayla
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

      // Kullanıcının is_verified durumunu güncelle
      const request = requests.find(r => r.id === requestId)
      if (request) {
        const { error: userError } = await supabase
          .from('users')
          .update({ is_verified: true })
          .eq('id', request.user_id)
        
        if (userError) {
          console.error('Kullanıcı doğrulama durumu güncellenirken hata:', userError)
          return
        }
      }
      
      // UI'yi güncelle
      setRequests(requests.map(request => 
        request.id === requestId ? { 
          ...request, 
          is_verified: true,
          verified_at: new Date().toISOString()
        } : request
      ))
    } catch (error) {
      console.error('Doğrulama onaylanırken genel hata:', error)
    }
  }

  async function rejectVerification(requestId: string) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error } = await supabase
        .from('user_verification')
        .delete()
        .eq('id', requestId)
      
      if (error) {
        console.error('Doğrulama isteği reddedilirken hata:', error)
        return
      }
      
      // UI'den kaldır
      setRequests(requests.filter(request => request.id !== requestId))
    } catch (error) {
      console.error('Doğrulama isteği reddedilirken genel hata:', error)
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Doğrulama Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Doğrulama istekleri yükleniyor...</div>
        </div>
      </main>
    )
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
                    <div className="flex gap-2">
                      {!request.is_verified && (
                        <>
                          <button 
                            onClick={() => approveVerification(request.id)}
                            className="btn btn-success btn-sm"
                          >
                            Onayla
                          </button>
                          <button 
                            onClick={() => rejectVerification(request.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Reddet
                          </button>
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
    </main>
  )
}