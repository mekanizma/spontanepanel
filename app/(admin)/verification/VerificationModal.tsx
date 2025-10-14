'use client'

import { createServiceSupabaseClient } from '@/lib/supabaseService'
import { useState } from 'react'

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

interface VerificationModalProps {
  request: VerificationRequest
  onClose: () => void
  onUpdate: () => void
}

export default function VerificationModal({ request, onClose, onUpdate }: VerificationModalProps) {
  const [loading, setLoading] = useState(false)

  async function approveVerification(requestId: string) {
    setLoading(true)
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
      const { error: userError } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', request.user_id)
      
      if (userError) {
        console.error('Kullanıcı doğrulama durumu güncellenirken hata:', userError)
        alert('Kullanıcı doğrulama durumu güncellenirken hata oluştu')
        return
      }
      
      alert('Doğrulama başarıyla onaylandı!')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Doğrulama onaylanırken genel hata:', error)
      alert('Doğrulama onaylanırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function rejectVerification(requestId: string) {
    if (!confirm('Bu doğrulama isteğini reddetmek istediğinizden emin misiniz?')) {
      return
    }
    
    setLoading(true)
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
      
      alert('Doğrulama isteği başarıyla reddedildi!')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Doğrulama isteği reddedilirken genel hata:', error)
      alert('Doğrulama isteği reddedilirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Doğrulama Detayları</h2>
          <button 
            onClick={onClose}
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
                {request.users?.[0]?.profile_image_url ? (
                  <img 
                    src={request.users[0].profile_image_url} 
                    alt={request.users[0].username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold">
                    {request.users?.[0]?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <div className="font-medium">{request.users?.[0]?.full_name || request.users?.[0]?.username}</div>
                <div className="text-sm text-muted">@{request.users?.[0]?.username}</div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Doğrulama Türü</label>
            <span className="badge badge-info">{request.verification_type}</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Gönderilen Veriler</label>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <pre>{JSON.stringify(request.verification_data, null, 2)}</pre>
            </div>
          </div>
          
          {/* Resim varsa göster */}
          {request.verification_data?.image_url && (
            <div>
              <label className="block text-sm font-medium mb-1">Gönderilen Resim</label>
              <div className="border rounded p-2">
                <img 
                  src={request.verification_data.image_url} 
                  alt="Doğrulama resmi"
                  className="max-w-full h-auto rounded"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Durum</label>
            {request.is_verified ? (
              <span className="badge badge-success">Doğrulandı</span>
            ) : (
              <span className="badge badge-warning">Bekliyor</span>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">İstek Tarihi</label>
            <div className="text-sm">
              {new Date(request.created_at).toLocaleString('tr-TR')}
            </div>
          </div>
          
          {request.verified_at && (
            <div>
              <label className="block text-sm font-medium mb-1">Doğrulama Tarihi</label>
              <div className="text-sm">
                {new Date(request.verified_at).toLocaleString('tr-TR')}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-6">
          {!request.is_verified && (
            <>
              <button 
                onClick={() => approveVerification(request.id)}
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? 'İşleniyor...' : 'Onayla'}
              </button>
              <button 
                onClick={() => rejectVerification(request.id)}
                disabled={loading}
                className="btn btn-danger"
              >
                {loading ? 'İşleniyor...' : 'Reddet'}
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="btn btn-secondary"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
