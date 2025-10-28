'use client'

import { useState, useEffect } from 'react'

interface VerificationRequest {
  id: string
  user_id: string
  verification_type: string
  verification_data: any
  is_verified: boolean
  created_at: string
  verified_at: string | null
  users: {
    username: string | null
    email: string | null
    full_name: string | null
    profile_image_url: string | null
  } | null
}

async function getVerificationRequests(): Promise<VerificationRequest[]> {
  console.log('✅ Verification Requests yükleniyor...')
  
  try {
    console.log('✅ Verification Requests tablosundan veri çekiliyor...')
    const res = await fetch('/api/admin/verification', { 
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `HTTP ${res.status}`)
    }
    const body = await res.json()
    console.log('✅ Verification Requests sonucu:', { count: body.requests?.length || 0, error: null })
    return body.requests || []
  } catch (error) {
    console.error('Doğrulama istekleri yüklenirken genel hata:', error)
    throw new Error('Doğrulama istekleri yüklenirken hata oluştu')
  }
}

export default function VerificationPage() {
  function resolveVerificationUrl(rawUrl: string | undefined) {
    if (!rawUrl) return ''
    
    try {
      const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supaUrl || !anon) {
        return rawUrl
      }
      
      // URL'i parse et
      const u = new URL(rawUrl)
      
      // Cloudflare Worker proxy'si kullanılıyorsa, direkt Supabase'e yönlendir
      if (u.hostname.endsWith('.workers.dev') && u.pathname.startsWith('/supabase/')) {
        // Cloudflare Worker path'inden Supabase path'ini çıkar
        // Örnek: /supabase/storage/v1/object/public/verification-images/... 
        // -> storage/v1/object/public/verification-images/...
        const supabasePath = u.pathname.replace(/^\/supabase\//, '')
        
        // Yeni Supabase URL'i oluştur
        return `${supaUrl.replace(/\/$/, '')}/${supabasePath}?apikey=${anon}`
      }
      
      // Zaten Supabase URL'i ise
      if (u.hostname.includes('supabase.co') || u.hostname.includes('supabase')) {
        return rawUrl
      }
      
      return rawUrl
    } catch {
      return rawUrl || ''
    }
  }
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function loadVerificationRequests() {
      try {
        const requestsData = await getVerificationRequests()
        setRequests(requestsData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
        setLoading(false)
      }
    }
    loadVerificationRequests()
  }, [])

  function openModal(request: VerificationRequest) {
    setSelectedRequest(request)
    setShowModal(true)
  }

  function closeModal() {
    setSelectedRequest(null)
    setShowModal(false)
  }

  async function approveVerification(requestId: string) {
    try {
      const res = await fetch('/api/admin/verification/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Doğrulama onaylanırken hata:', body)
        alert(body.error || 'Doğrulama onaylanırken hata oluştu')
        return
      }
      
      closeModal()
      alert('Doğrulama başarıyla onaylandı!')
      
      // Verileri yeniden yükle
      const updatedRequests = await getVerificationRequests()
      setRequests(updatedRequests)
    } catch (error) {
      console.error('Doğrulama onaylanırken genel hata:', error)
      alert('Doğrulama onaylanırken hata oluştu')
    }
  }

  async function rejectVerification(requestId: string) {
    if (!confirm('Bu doğrulama isteğini reddetmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const res = await fetch('/api/admin/verification/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Doğrulama isteği reddedilirken hata:', body)
        alert(body.error || 'Doğrulama isteği reddedilirken hata oluştu')
        return
      }
      
      closeModal()
      alert('Doğrulama isteği başarıyla reddedildi!')
      
      // Verileri yeniden yükle
      const updatedRequests = await getVerificationRequests()
      setRequests(updatedRequests)
    } catch (error) {
      console.error('Doğrulama isteği reddedilirken genel hata:', error)
      alert('Doğrulama isteği reddedilirken hata oluştu')
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
                    <div className="font-medium truncate max-w-[220px]">
                      {request.users?.full_name || '—'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{request.verification_type}</span>
                  </td>
                  <td>
                    <div className="text-sm text-muted">
                      {request.verification_data?.selfie_url ? (
                        <a
                          href={resolveVerificationUrl(request.verification_data.selfie_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          Selfie görüntüsünü yeni sekmede aç
                        </a>
                      ) : (
                        <span>-</span>
                      )}
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
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => openModal(request)}
                        className="btn btn-info btn-sm w-full sm:w-auto"
                      >
                        Detay
                      </button>
                      {!request.is_verified && (
                        <>
                          <button 
                            onClick={() => approveVerification(request.id)}
                            className="btn btn-success btn-sm w-full sm:w-auto"
                          >
                            Onayla
                          </button>
                          <button 
                            onClick={() => rejectVerification(request.id)}
                            className="btn btn-danger btn-sm w-full sm:w-auto"
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

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Doğrulama Detayları</h2>
              <button 
                onClick={closeModal}
                className="btn btn-sm btn-circle"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kullanıcı</label>
                <div className="font-medium truncate">
                  {selectedRequest.users?.full_name || '—'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Doğrulama Türü</label>
                <span className="badge badge-info">{selectedRequest.verification_type}</span>
              </div>
              
              {/* Gönderilen verilerin ham JSON içeriği gizlendi */}
              
              {/* Resim varsa göster */}
              {(selectedRequest.verification_data?.selfie_url || selectedRequest.verification_data?.image_url) && (
                <div>
                  <label className="block text-sm font-medium mb-2">Gönderilen Resim</label>
                  <div className="mt-2">
                    <img 
                      src={resolveVerificationUrl(selectedRequest.verification_data?.selfie_url || selectedRequest.verification_data?.image_url)} 
                      alt="Doğrulama resmi"
                      className="max-w-full h-auto border rounded-lg"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                  <a
                    href={resolveVerificationUrl(selectedRequest.verification_data?.selfie_url || selectedRequest.verification_data?.image_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm mt-2 inline-block"
                  >
                    Tam boyutta aç
                  </a>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Durum</label>
                {selectedRequest.is_verified ? (
                  <span className="badge badge-success">Doğrulandı</span>
                ) : (
                  <span className="badge badge-warning">Bekliyor</span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">İstek Tarihi</label>
                <div className="text-sm">
                  {new Date(selectedRequest.created_at).toLocaleString('tr-TR')}
                </div>
              </div>
              
              {selectedRequest.verified_at && (
                <div>
                  <label className="block text-sm font-medium mb-1">Doğrulama Tarihi</label>
                  <div className="text-sm">
                    {new Date(selectedRequest.verified_at).toLocaleString('tr-TR')}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-6">
              {!selectedRequest.is_verified && (
                <>
                  <button 
                    onClick={() => approveVerification(selectedRequest.id)}
                    className="btn btn-success w-full sm:w-auto"
                  >
                    Onayla
                  </button>
                  <button 
                    onClick={() => rejectVerification(selectedRequest.id)}
                    className="btn btn-danger w-full sm:w-auto"
                  >
                    Reddet
                  </button>
                </>
              )}
              <button 
                onClick={closeModal}
                className="btn btn-secondary w-full sm:w-auto"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}