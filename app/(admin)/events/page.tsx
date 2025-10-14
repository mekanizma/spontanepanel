import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

async function getAllEvents() {
  const supabase = await getServerSupabase()

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        location,
        image_url,
        creator_id,
        status,
        created_at,
        users!creator_id (
          username,
          full_name,
          profile_image_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Etkinlikler yüklenirken hata:', error)
      return []
    }

    return events || []
  } catch (error) {
    console.error('Etkinlikler yüklenirken genel hata:', error)
    return []
  }
}

export default async function EventsPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/login?redirect=/events')
  }
  
  const events = await getAllEvents()

  async function approve(formData: FormData) {
    'use server'
    try {
      const id = String(formData.get('id'))
      const supabase = await getServerSupabase()
      const { error } = await supabase.from('events').update({ status: 'approved' }).eq('id', id)
      
      if (error) {
        console.error('Etkinlik onaylanırken hata:', error)
      }
    } catch (error) {
      console.error('Etkinlik onaylanırken genel hata:', error)
    }
  }

  async function reject(formData: FormData) {
    'use server'
    try {
      const id = String(formData.get('id'))
      const supabase = await getServerSupabase()
      const { error } = await supabase.from('events').update({ status: 'rejected' }).eq('id', id)
      
      if (error) {
        console.error('Etkinlik reddedilirken hata:', error)
      }
    } catch (error) {
      console.error('Etkinlik reddedilirken genel hata:', error)
    }
  }

  async function deactivate(formData: FormData) {
    'use server'
    try {
      const id = String(formData.get('id'))
      const supabase = await getServerSupabase()
      const { error } = await supabase.from('events').update({ status: 'inactive' }).eq('id', id)
      
      if (error) {
        console.error('Etkinlik pasif yapılırken hata:', error)
      }
    } catch (error) {
      console.error('Etkinlik pasif yapılırken genel hata:', error)
    }
  }

  return (
    <main>
      <h1>Etkinlik Yönetimi</h1>
      
      <div className="card mt-6">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Etkinlik</th>
                <th>Oluşturan</th>
                <th>Tarih</th>
                <th>Konum</th>
                <th>Durum</th>
                <th>Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event: any) => (
                <tr key={event.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                        {event.image_url ? (
                          <img 
                            src={event.image_url} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🎉</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{event.title}</div>
                        <div className="text-sm text-muted line-clamp-2">
                          {event.description}
                        </div>
                        <div className="text-xs text-muted">ID: {event.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {event.users?.profile_image_url ? (
                          <img 
                            src={event.users.profile_image_url} 
                            alt={event.users.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {event.users?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{event.users?.full_name || event.users?.username}</div>
                        <div className="text-sm text-muted">@{event.users?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(event.start_time).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-muted">
                        {new Date(event.start_time).toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {event.location || 'Belirtilmemiş'}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      {event.status === 'approved' && (
                        <span className="badge badge-success">Onaylandı</span>
                      )}
                      {event.status === 'pending' && (
                        <span className="badge badge-warning">Bekliyor</span>
                      )}
                      {event.status === 'rejected' && (
                        <span className="badge badge-error">Reddedildi</span>
                      )}
                      {event.status === 'inactive' && (
                        <span className="badge badge-error">Pasif</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {event.status === 'pending' && (
                        <>
                          <form action={approve}>
                            <input type="hidden" name="id" value={event.id} />
                            <button type="submit" className="btn btn-success btn-sm">
                              Onayla
                            </button>
                          </form>
                          <form action={reject}>
                            <input type="hidden" name="id" value={event.id} />
                            <button type="submit" className="btn btn-danger btn-sm">
                              Reddet
                            </button>
                          </form>
                        </>
                      )}
                      
                      {event.status === 'approved' && (
                        <form action={deactivate}>
                          <input type="hidden" name="id" value={event.id} />
                          <button type="submit" className="btn btn-warning btn-sm">
                            Pasif Yap
                          </button>
                        </form>
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


