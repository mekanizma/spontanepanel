'use client'

import { createServiceSupabaseClient } from '@/lib/supabaseService'
import { useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
  full_name: string
  is_premium: boolean
  profile_image_url: string | null
}

interface PremiumFormProps {
  onUpdate: () => void
}

export default function PremiumForm({ onUpdate }: PremiumFormProps) {
  const [showForm, setShowForm] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [premiumDuration, setPremiumDuration] = useState('30')

  useEffect(() => {
    async function loadUsers() {
      try {
        const supabase = createServiceSupabaseClient()
        const { data: usersData, error } = await supabase
          .from('users')
          .select(`
            id,
            username,
            email,
            full_name,
            is_premium,
            profile_image_url
          `)
          .order('username', { ascending: true })

        if (error) {
          console.error('Kullanıcılar yüklenirken hata:', error)
          return
        }

        setUsers(usersData || [])
      } catch (error) {
        console.error('Kullanıcılar yüklenirken genel hata:', error)
      }
    }
    loadUsers()
  }, [])

  async function assignPremium() {
    if (!selectedUser) {
      alert('Lütfen bir kullanıcı seçin')
      return
    }

    try {
      const supabase = createServiceSupabaseClient()
      
      // Premium bitiş tarihini hesapla
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + parseInt(premiumDuration))
      
      const { error } = await supabase
        .from('users')
        .update({ 
          is_premium: true,
          premium_expires_at: expiresAt.toISOString()
        })
        .eq('id', selectedUser)
      
      if (error) {
        console.error('Premium atanırken hata:', error)
        alert('Premium atanırken hata oluştu')
        return
      }
      
      // Formu sıfırla
      setSelectedUser('')
      setPremiumDuration('30')
      setShowForm(false)
      
      alert('Premium başarıyla atandı!')
      onUpdate()
    } catch (error) {
      console.error('Premium atanırken genel hata:', error)
      alert('Premium atanırken hata oluştu')
    }
  }

  return (
    <div className="card mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Premium Atama</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Formu Gizle' : 'Yeni Premium Ata'}
        </button>
      </div>
      
      {showForm && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kullanıcı Seç</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="input w-full"
            >
              <option value="">Kullanıcı seçin...</option>
              {users.filter(user => !user.is_premium).map((user) => (
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
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
