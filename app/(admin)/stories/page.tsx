import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getStories() {
  const supabase = await getServerSupabase()
  const { data } = await supabase
    .from('stories')
    .select(`
      id,
      user_id,
      media_url,
      is_active,
      expires_at,
      created_at,
      users!user_id (
        username,
        full_name,
        profile_image_url
      )
    `)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function StoriesPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/stories')
  }
  
  const stories = await getStories()

  async function remove(formData: FormData) {
    'use server'
    const id = String(formData.get('id'))
    const supabase = await getServerSupabase()
    await supabase.from('stories').delete().eq('id', id)
  }

  return (
    <main>
      <h1>Hikaye Yönetimi</h1>
      
      <div className="card mt-6">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Hikaye</th>
                <th>Kullanıcı</th>
                <th>Durum</th>
                <th>Bitiş Tarihi</th>
                <th>Oluşturulma</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story: any) => (
                <tr key={story.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                        {story.media_url ? (
                          <img 
                            src={story.media_url} 
                            alt="Hikaye"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(story.media_url, '_blank')}
                          />
                        ) : (
                          <span className="text-2xl">📖</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">Hikaye #{story.id}</div>
                        <div className="text-sm text-muted">
                          {story.media_url ? 'Medya içerikli' : 'Metin hikayesi'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {story.users?.profile_image_url ? (
                          <img 
                            src={story.users.profile_image_url} 
                            alt={story.users.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {story.users?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{story.users?.full_name || story.users?.username}</div>
                        <div className="text-sm text-muted">@{story.users?.username}</div>
                        <div className="text-xs text-muted">ID: {story.user_id}</div>
                      </div>
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
                      {new Date(story.expires_at).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="text-xs text-muted">
                      {new Date(story.expires_at).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {new Date(story.created_at).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="text-xs text-muted">
                      {new Date(story.created_at).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td>
                    <form action={remove}>
                      <input type="hidden" name="id" value={story.id} />
                      <button 
                        type="submit" 
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          if (!confirm('Bu hikayeyi silmek istediğinizden emin misiniz?')) {
                            e.preventDefault()
                          }
                        }}
                      >
                        Sil
                      </button>
                    </form>
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




