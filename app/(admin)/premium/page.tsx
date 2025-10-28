'use client'

import { useState, useEffect } from 'react'

interface PremiumUser {
  id: string
  username: string
  email: string
  full_name: string
  is_premium: boolean
  premium_expires_at: string | null
  created_at: string
  profile_image_url: string | null
}

interface User {
  id: string
  username: string
  email: string
  full_name: string
  is_premium: boolean
  profile_image_url: string | null
}

async function getPremiumUsers(): Promise<PremiumUser[]> {
  console.log('⭐ Premium Users yükleniyor...')
  try {
    const res = await fetch('/api/admin/users?premium=true', { cache: 'no-store' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `HTTP ${res.status}`)
    }
    const body = await res.json()
    console.log('⭐ API Response:', body)
    console.log('⭐ Premium users count:', body.users?.length)
    return body.users || []
  } catch (error) {
    console.error('Premium kullanıcılar yüklenirken genel hata:', error)
    throw new Error('Premium kullanıcılar yüklenirken hata oluştu')
  }
}

async function getAllUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/admin/users/all', { cache: 'no-store' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `HTTP ${res.status}`)
    }
    const body = await res.json()
    return body.users || []
  } catch (error) {
    console.error('Kullanıcılar yüklenirken genel hata:', error)
    throw new Error('Kullanıcılar yüklenirken hata oluştu')
  }
}

// İsim temizleme fonksiyonu
function getCleanUserName(user: PremiumUser | User): string {
  // Eğer full_name varsa direkt kullan
  if (user.full_name) {
    // Full name'deki tüm sayıları ve gereksiz karakterleri temizle
    let cleanName = user.full_name;
    // Başındaki ve sonundaki sayıları temizle
    cleanName = cleanName.replace(/^\d+\s*/, '').replace(/\s*\d+$/, '');
    // Kelimeler arasındaki tek başına sayıları temizle (örn: "Kart 2" -> "Kart")
    cleanName = cleanName.replace(/\s+\d+\s*/g, ' ');
    return cleanName.trim();
  }
  
  // Username'i temizle ve isim/soyisim gibi davran
  let username = user.username;
  
  // Başındaki sayıları, underscore'ları ve özel karakterleri temizle
  username = username.replace(/^[0-9_$]+/, '');
  
  // Sonundaki sayılar ve karakterleri temizle
  username = username.replace(/[0-9_]+$/, '');
  
  // Eğer "user_" ile başlıyorsa, onu da temizle
  username = username.replace(/^user_/, '');
  
  // Underscore'ları boşlukla değiştir
  username = username.replace(/_/g, ' ');
  
  // Tek başına sayıları temizle
  username = username.replace(/\s+\d+\s*/g, ' ');
  
  // Trim yap ve büyük harfle başlat
  username = username.trim();
  if (username) {
    username = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  }
  
  return username || 'Kullanıcı';
}

export default function PremiumPage() {
  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [premiumDuration, setPremiumDuration] = useState('30') // gün

  useEffect(() => {
    async function loadData() {
      try {
        const [premiumData, usersData] = await Promise.all([
          getPremiumUsers(),
          getAllUsers()
        ])
        setPremiumUsers(premiumData)
        setAllUsers(usersData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
        setLoading(false)
      }
    }
    loadData()
  }, [])

  async function assignPremium() {
    if (!selectedUser) {
      alert('Lütfen bir kullanıcı seçin')
      return
    }

    try {
      // Premium bitiş tarihini hesapla
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + parseInt(premiumDuration))
      
      const res = await fetch('/api/admin/premium/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser, expiresAt: expiresAt.toISOString() })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Premium atanırken hata:', body)
        alert(body.error || 'Premium atanırken hata oluştu')
        return
      }
      
      // Listeyi yenile
      const premiumData = await getPremiumUsers()
      setPremiumUsers(premiumData)
      
      // Formu sıfırla
      setSelectedUser('')
      setPremiumDuration('30')
      setShowAssignForm(false)
      
      alert('Premium başarıyla atandı!')
    } catch (error) {
      console.error('Premium atanırken genel hata:', error)
      alert('Premium atanırken hata oluştu')
    }
  }

  async function revokePremium(userId: string) {
    if (!confirm('Bu kullanıcının premium üyeliğini iptal etmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const res = await fetch('/api/admin/premium/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Premium üyelik iptal edilirken hata:', body)
        alert(body.error || 'Premium üyelik iptal edilirken hata oluştu')
        return
      }
      
      // Listeyi yenile
      const premiumData = await getPremiumUsers()
      setPremiumUsers(premiumData)
      
      alert('Premium üyelik başarıyla iptal edildi!')
    } catch (error) {
      console.error('Premium üyelik iptal edilirken genel hata:', error)
      alert('Premium üyelik iptal edilirken hata oluştu')
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Premium Üye Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Premium kullanıcılar yükleniyor...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Premium Üye Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Premium Üye Yönetimi</h1>
      
      {/* Premium Atama Formu */}
      <div className="card mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Premium Atama</h2>
          <button 
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="btn btn-primary"
          >
            {showAssignForm ? 'Formu Gizle' : 'Yeni Premium Ata'}
          </button>
        </div>
        
        {showAssignForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kullanıcı Seç</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="input w-full"
              >
                <option value="">Kullanıcı seçin...</option>
                {allUsers.filter(user => !user.is_premium).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Premium Süresi (gün)</label>
              <select
                value={premiumDuration}
                onChange={(e) => setPremiumDuration(e.target.value)}
                className="input w-full"
              >
                <option value="7">7 Gün</option>
                <option value="30">30 Gün</option>
                <option value="90">90 Gün</option>
                <option value="365">1 Yıl</option>
                <option value="9999">Süresiz</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={assignPremium}
                className="btn btn-success"
              >
                Premium Ata
              </button>
              <button 
                onClick={() => setShowAssignForm(false)}
                className="btn btn-secondary"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Premium Kullanıcılar */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Premium Kullanıcılar</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>E-posta</th>
                <th>Premium Bitiş Tarihi</th>
                <th>Kayıt Tarihi</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {premiumUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="font-semibold">{getCleanUserName(user)}</div>
                  </td>
                  <td>
                    <div className="text-sm">{user.email}</div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {user.premium_expires_at ? (
                        <span className="badge badge-warning">
                          {new Date(user.premium_expires_at).toLocaleDateString('tr-TR')}
                        </span>
                      ) : (
                        <span className="badge badge-success">Süresiz</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => revokePremium(user.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Premium İptal Et
                    </button>
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