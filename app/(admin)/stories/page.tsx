'use client'

import React, { useState, useEffect } from 'react'
import { createServiceSupabaseClient } from '@/lib/supabaseService'

interface Story {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
  expires_at: string
  users: {
    username: string
    full_name: string
    profile_image_url: string | null
  }[] | null
}

async function getStories(): Promise<Story[]> {
  console.log('📖 Stories yükleniyor...')
  
  const supabase = createServiceSupabaseClient()

  try {
    console.log('📖 Stories tablosundan veri çekiliyor...')
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        id,
        user_id,
        content,
        image_url,
        created_at,
        expires_at,
        users!user_id (
          username,
          full_name,
          profile_image_url
        )
      `)
      .order('created_at', { ascending: false })

    console.log('📖 Stories sonucu:', { count: stories?.length, error })

    if (error) {
      console.error('Hikayeler yüklenirken hata:', error)
      throw new Error('Hikayeler yüklenirken hata oluştu')
    }

    return stories || []
  } catch (error) {
    console.error('Hikayeler yüklenirken genel hata:', error)
    throw new Error('Hikayeler yüklenirken hata oluştu')
  }
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function loadStories() {
      try {
        const storiesData = await getStories()
        setStories(storiesData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
        setLoading(false)
      }
    }
    loadStories()
  }, [])

  function openModal(story: Story) {
    setSelectedStory(story)
    setShowModal(true)
  }

  function closeModal() {
    setSelectedStory(null)
    setShowModal(false)
  }

  async function deleteStory(storyId: string) {
    if (!confirm('Bu hikayeyi silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const supabase = createServiceSupabaseClient()
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
      
      if (error) {
        console.error('Hikaye silinirken hata:', error)
        alert('Hikaye silinirken hata oluştu')
        return
      }
      
      // UI'den kaldır
      setStories(stories.filter(story => story.id !== storyId))
      closeModal()
      alert('Hikaye başarıyla silindi!')
    } catch (error) {
      console.error('Hikaye silinirken genel hata:', error)
      alert('Hikaye silinirken hata oluştu')
    }
  }

  function isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <main>
        <h1>Hikaye Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Hikayeler yükleniyor...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>Hikaye Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>Hikaye Yönetimi</h1>
      
      <div className="card mt-6">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>İçerik</th>
                <th>Resim</th>
                <th>Durum</th>
                <th>Oluşturma Tarihi</th>
                <th>Bitiş Tarihi</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {story.users?.[0]?.profile_image_url ? (
                          <img 
                            src={story.users[0].profile_image_url} 
                            alt={story.users[0].username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {story.users?.[0]?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{story.users?.[0]?.full_name || story.users?.[0]?.username}</div>
                        <div className="text-sm text-muted">@{story.users?.[0]?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-muted line-clamp-2 max-w-xs">
                      {story.content}
                    </div>
                  </td>
                  <td>
                    {story.image_url ? (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src={story.image_url} 
                          alt="Hikaye resmi"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-muted">Resim yok</span>
                    )}
                  </td>
                  <td>
                    {isExpired(story.expires_at) ? (
                      <span className="badge badge-error">Süresi Dolmuş</span>
                    ) : (
                      <span className="badge badge-success">Aktif</span>
                    )}
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(story.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(story.expires_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openModal(story)}
                        className="btn btn-info btn-sm"
                      >
                        Detay
                      </button>
                      <button 
                        onClick={() => deleteStory(story.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Hikaye Detayları</h2>
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
                    {selectedStory.users?.[0]?.profile_image_url ? (
                      <img 
                        src={selectedStory.users[0].profile_image_url} 
                        alt={selectedStory.users[0].username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {selectedStory.users?.[0]?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{selectedStory.users?.[0]?.full_name || selectedStory.users?.[0]?.username}</div>
                    <div className="text-sm text-muted">@{selectedStory.users?.[0]?.username}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">İçerik</label>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  {selectedStory.content}
                </div>
              </div>
              
              {selectedStory.image_url && (
                <div>
                  <label className="block text-sm font-medium mb-1">Resim</label>
                  <div className="border rounded p-2">
                    <img 
                      src={selectedStory.image_url} 
                      alt="Hikaye resmi"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Durum</label>
                {isExpired(selectedStory.expires_at) ? (
                  <span className="badge badge-error">Süresi Dolmuş</span>
                ) : (
                  <span className="badge badge-success">Aktif</span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Oluşturma Tarihi</label>
                <div className="text-sm">
                  {new Date(selectedStory.created_at).toLocaleString('tr-TR')}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
                <div className="text-sm">
                  {new Date(selectedStory.expires_at).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => deleteStory(selectedStory.id)}
                className="btn btn-danger"
              >
                Hikayeyi Sil
              </button>
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