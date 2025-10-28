import { createServiceSupabaseClient } from '@/lib/supabaseService'
import EventActions from './EventActions'

export const dynamic = 'force-dynamic'

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
    
    // Önce events'i çek
    const { data: events, error: eventsError } = await supabase
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
        created_at
      `)
      .order('created_at', { ascending: false })

    console.log('🎉 Events sonucu:', { count: events?.length, error: eventsError })

    if (eventsError) {
      console.error('Etkinlikler yüklenirken hata:', eventsError)
      throw new Error('Etkinlikler yüklenirken hata oluştu')
    }

    if (!events || events.length === 0) {
      return []
    }

    // Her event için creator bilgisini ayrı ayrı çek
    const eventsWithUsers = await Promise.all(
      events.map(async (event) => {
        if (event.creator_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('username, full_name, profile_image_url')
            .eq('id', event.creator_id)
            .single()

          return {
            ...event,
            users: userData ? [userData] : null
          }
        }
        return { ...event, users: null }
      })
    )

    console.log('🎉 Events with users:', eventsWithUsers.slice(0, 2))

    return eventsWithUsers
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
                      <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                        {event.image_url ? (
                          <img 
                            src={event.image_url} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm">🎉</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-sm text-muted line-clamp-1">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">
                      {event.users?.[0]?.full_name || event.users?.[0]?.username || 'Bilinmeyen Kullanıcı'}
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
                    <div className="text-sm max-w-32 truncate">
                      {event.location || 'Belirtilmemiş'}
                    </div>
                  </td>
                  <td>
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
                  </td>
                  <td>
                    <EventActions eventId={event.id} status={event.status} />
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