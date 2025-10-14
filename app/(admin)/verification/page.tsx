'use client'

import React, { useState, useEffect } from 'react'
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

export default function VerificationPage() {
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
      const supabase = createServiceSupabaseClient()
      
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
        alert('Doğrulama onaylanırken hata oluştu')
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
          alert('Kullanıcı doğrulama durumu güncellenirken hata oluştu')
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
      
      closeModal()
      alert('Doğrulama başarıyla onaylandı!')
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
      const supabase = createServiceSupabaseClient()
      const { error } = await supabase
        .from('user_verification')
        .delete()
        .eq('id', requestId)
      
      if (error) {
        console.error('Doğrulama isteği reddedilirken hata:', error)
        alert('Doğrulama isteği reddedilirken hata oluştu')
        return
      }
      
      // UI'den kaldır
      setRequests(requests.filter(request => request.id !== requestId))
      closeModal()
      alert('Doğrulama isteği başarıyla reddedildi!')
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
                      <button 
                        onClick={() => openModal(request)}
                        className="btn btn-info btn-sm"
                      >
                        Detay
                      </button>
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
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {selectedRequest.users?.[0]?.profile_image_url ? (
                      <img 
                        src={selectedRequest.users[0].profile_image_url} 
                        alt={selectedRequest.users[0].username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {selectedRequest.users?.[0]?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{selectedRequest.users?.[0]?.full_name || selectedRequest.users?.[0]?.username}</div>
                    <div className="text-sm text-muted">@{selectedRequest.users?.[0]?.username}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Doğrulama Türü</label>
                <span className="badge badge-info">{selectedRequest.verification_type}</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Gönderilen Veriler</label>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <pre>{JSON.stringify(selectedRequest.verification_data, null, 2)}</pre>
                </div>
              </div>
              
              {/* Resim varsa göster */}
              {selectedRequest.verification_data?.image_url && (
                <div>
                  <label className="block text-sm font-medium mb-1">Gönderilen Resim</label>
                  <div className="border rounded p-2">
                    <img 
                      src={selectedRequest.verification_data.image_url} 
                      alt="Doğrulama resmi"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
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
            
            <div className="flex gap-2 mt-6">
              {!selectedRequest.is_verified && (
                <>
                  <button 
                    onClick={() => approveVerification(selectedRequest.id)}
                    className="btn btn-success"
                  >
                    Onayla
                  </button>
                  <button 
                    onClick={() => rejectVerification(selectedRequest.id)}
                    className="btn btn-danger"
                  >
                    Reddet
                  </button>
                </>
              )}
              <button 
                onClick={closeModal}
                className="btn btn-secondary"
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