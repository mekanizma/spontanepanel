import { createServiceSupabaseClient } from '@/lib/supabaseService'

interface Event {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  image_url: string | null
  creator_id: string
  status: string
  created_at: string
  users: {
    username: string
    full_name: string
    profile_image_url: string | null
  }[] | null
}

async function getEvents(): Promise<Event[]> {
  console.log('🎉 Events yükleniyor...')
  
  const supabase = createServiceSupabaseClient()

  try {
    console.log('🎉 Events tablosundan veri çekiliyor...')
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
        users!events_creator_id_fkey (
          username,
          full_name,
          profile_image_url
        )
      `)
      .order('created_at', { ascending: false })

    console.log('🎉 Events sonucu:', { count: events?.length, error })

    if (error) {
      console.error('Etkinlikler yüklenirken hata:', error)
      throw new Error('Etkinlikler yüklenirken hata oluştu')
    }

    return events || []
  } catch (error) {
    console.error('Etkinlikler yüklenirken genel hata:', error)
    throw new Error('Etkinlikler yüklenirken hata oluştu')
  }
}

export default async function EventsPage() {
  let events: Event[]
  let error: string | null = null

  try {
    events = await getEvents()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Bilinmeyen hata'
    events = []
  }

  if (error) {
    return (
      <main>
        <h1>Etkinlik Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </main>
    )
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
              {events.map((event) => (
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
                        {event.users?.[0]?.profile_image_url ? (
                          <img 
                            src={event.users[0].profile_image_url} 
                            alt={event.users[0].username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {event.users?.[0]?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{event.users?.[0]?.full_name || event.users?.[0]?.username}</div>
                        <div className="text-sm text-muted">@{event.users?.[0]?.username}</div>
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
                    <div className="text-sm text-muted">
                      {event.status === 'pending' ? 'Bekliyor' : 
                       event.status === 'approved' ? 'Onaylandı' : 
                       event.status === 'rejected' ? 'Reddedildi' : 'Pasif'}
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