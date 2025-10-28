'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'

interface Story {
  id: string
  user_id: string
  caption: string | null
  image_url: string | null
  created_at: string
  expires_at: string | null
  is_active: boolean
  users: {
    username: string
    full_name: string
    profile_image_url: string | null
  }[] | null
}

async function getStories(): Promise<Story[]> {
  console.log('📖 Stories yükleniyor...')
  
  const supabase = createClientComponentClient()

  try {
    console.log('📖 Stories tablosundan veri çekiliyor...')
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('📖 Stories sonucu:', { count: stories?.length, error })
    
    // İlk story'nin tüm sütunlarını logla
    if (stories && stories.length > 0) {
      console.log('📝 İlk story örneği:', stories[0])
    }

    if (error) {
      console.error('Hikayeler yüklenirken hata:', error)
      // Stories tablosu yoksa boş array döndür
      if (error.code === 'PGRST205') {
        console.log('⚠️ Stories tablosu bulunamadı, boş array döndürülüyor')
        return []
      }
      throw new Error('Hikayeler yüklenirken hata oluştu')
    }

    if (!stories || stories.length === 0) {
      return []
    }

    // Kullanıcı bilgilerini ayrı olarak çek
    const userIds = [...new Set(stories.map((s: any) => s.user_id))]
    console.log('🔍 User IDs:', userIds)
    
    // Önce users tablosunu dene
    let usersData: any[] = []
    let usersError: any = null
    
    const { data: usersResult, error: usersErr } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds)

    console.log('👥 Users data (users tablosu - tüm sütunlar):', usersResult)
    console.log('❌ Users error (users tablosu):', usersErr)

    if (usersResult && usersResult.length > 0) {
      usersData = usersResult
    } else {
      // Eğer users tablosu boşsa profiles tablosunu dene
      console.log('⚠️ Users tablosu boş veya hata var, profiles tablosu deneniyor...')
      const { data: profilesResult, error: profilesErr } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)
      
      console.log('👥 Profiles data:', profilesResult)
      console.log('❌ Profiles error:', profilesErr)
      
      if (profilesResult && profilesResult.length > 0) {
        usersData = profilesResult
      }
    }

    console.log('👥 Users data (final):', usersData)

    // Kullanıcı bilgilerini map'e dönüştür
    const usersMap = new Map()
    if (usersData && usersData.length > 0) {
      usersData.forEach((user: any) => {
        usersMap.set(user.id, user)
      })
    }

    console.log('🗺️ Users map:', Array.from(usersMap.entries()))

    // Stories'lara user bilgilerini ekle
    const storiesWithUsers = stories.map((story: any) => ({
      ...story,
      users: usersMap.has(story.user_id) ? [usersMap.get(story.user_id)] : null
    }))

    console.log('📝 Stories with users:', storiesWithUsers.slice(0, 3))

    return storiesWithUsers
  } catch (error) {
    console.error('Hikayeler yüklenirken genel hata:', error)
    // Stories tablosu yoksa boş array döndür
    if (error instanceof Error && error.message.includes('PGRST205')) {
      console.log('⚠️ Stories tablosu bulunamadı, boş array döndürülüyor')
      return []
    }
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
      const supabase = createClientComponentClient()
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

  async function toggleStoryStatus(storyId: string, currentStatus: boolean) {
    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase
        .from('stories')
        .update({ is_active: !currentStatus })
        .eq('id', storyId)
      
      if (error) {
        console.error('Hikaye durumu güncellenirken hata:', error)
        alert('Hikaye durumu güncellenirken hata oluştu')
        return
      }
      
      // UI'yi güncelle
      setStories(stories.map(story => 
        story.id === storyId ? { ...story, is_active: !currentStatus } : story
      ))
      
      alert(`Hikaye ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi!`)
    } catch (error) {
      console.error('Hikaye durumu güncellenirken genel hata:', error)
      alert('Hikaye durumu güncellenirken hata oluştu')
    }
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
        <h2 className="text-xl font-semibold mb-4">Hikayeler</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>İçerik</th>
                <th>Medya</th>
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
                      {story.users && story.users[0] ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {story.users[0].profile_image_url ? (
                              <img 
                                src={story.users[0].profile_image_url} 
                                alt={story.users[0].username || 'User'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold">
                                {story.users[0].username?.charAt(0).toUpperCase() || story.users[0].full_name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{story.users[0].full_name || story.users[0].username || 'Kullanıcı'}</div>
                            <div className="text-sm text-muted">@{story.users[0].username || 'unknown'}</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted">Kullanıcı bulunamadı (ID: {story.user_id})</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm max-w-48 truncate">
                      {story.caption || 'Metin içeriği yok'}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {story.image_url && (
                        <span className="badge badge-info">Resim</span>
                      )}
                      {!story.image_url && (
                        <span className="badge badge-secondary">Metin</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {story.is_active ? (
                      <span className="badge badge-success">Aktif</span>
                    ) : (
                      <span className="badge badge-error">Pasif</span>
                    )}
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(story.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {story.expires_at ? 
                        new Date(story.expires_at).toLocaleDateString('tr-TR') : 
                        'Süresiz'
                      }
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
                        onClick={() => toggleStoryStatus(story.id, story.is_active)}
                        className={`btn btn-sm ${story.is_active ? 'btn-warning' : 'btn-success'}`}
                      >
                        {story.is_active ? 'Pasif Yap' : 'Aktif Yap'}
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
                        alt={selectedStory.users[0].username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {selectedStory.users?.[0]?.username?.charAt(0).toUpperCase() || selectedStory.users?.[0]?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{selectedStory.users?.[0]?.full_name || selectedStory.users?.[0]?.username || 'Kullanıcı'}</div>
                    <div className="text-sm text-muted">@{selectedStory.users?.[0]?.username || 'unknown'}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">İçerik</label>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  {selectedStory.caption || 'Metin içeriği yok'}
                </div>
              </div>
              
              {/* Resim varsa göster */}
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
                {selectedStory.is_active ? (
                  <span className="badge badge-success">Aktif</span>
                ) : (
                  <span className="badge badge-error">Pasif</span>
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
                  {selectedStory.expires_at ? 
                    new Date(selectedStory.expires_at).toLocaleString('tr-TR') : 
                    'Süresiz'
                  }
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => toggleStoryStatus(selectedStory.id, selectedStory.is_active)}
                className={`btn ${selectedStory.is_active ? 'btn-warning' : 'btn-success'}`}
              >
                {selectedStory.is_active ? 'Pasif Yap' : 'Aktif Yap'}
              </button>
              <button 
                onClick={() => deleteStory(selectedStory.id)}
                className="btn btn-danger"
              >
                Sil
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