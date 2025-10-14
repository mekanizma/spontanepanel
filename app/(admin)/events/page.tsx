'use client'

import { useEffect, useState } from 'react'

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
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEvents() {
      console.log('🎉 Events yükleniyor...')
      
      // Doğrudan Supabase client oluştur
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://fbiibwhupuxizqacvhdt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaWlid2h1cHV4aXpxYWN2aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
      )

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
            users!creator_id (
              username,
              full_name,
              profile_image_url
            )
          `)
          .order('created_at', { ascending: false })

        console.log('🎉 Events sonucu:', { count: events?.length, error })

        if (error) {
          console.error('Etkinlikler yüklenirken hata:', error)
          setError('Etkinlikler yüklenirken hata oluştu')
          setLoading(false)
          return
        }

        setEvents(events || [])
        setLoading(false)
      } catch (error) {
        console.error('Etkinlikler yüklenirken genel hata:', error)
        setError('Etkinlikler yüklenirken hata oluştu')
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  async function approveEvent(id: string) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://fbiibwhupuxizqacvhdt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaWlid2h1cHV4aXpxYWN2aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
      )
      const { error } = await supabase.from('events').update({ status: 'approved' }).eq('id', id)
      
      if (error) {
        console.error('Etkinlik onaylanırken hata:', error)
        return
      }
      
      // UI'yi güncelle
      setEvents(events.map(event => 
        event.id === id ? { ...event, status: 'approved' } : event
      ))
    } catch (error) {
      console.error('Etkinlik onaylanırken genel hata:', error)
    }
  }

  async function rejectEvent(id: string) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://fbiibwhupuxizqacvhdt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaWlid2h1cHV4aXpxYWN2aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
      )
      const { error } = await supabase.from('events').update({ status: 'rejected' }).eq('id', id)
      
      if (error) {
        console.error('Etkinlik reddedilirken hata:', error)
        return
      }
      
      // UI'yi güncelle
      setEvents(events.map(event => 
        event.id === id ? { ...event, status: 'rejected' } : event
      ))
    } catch (error) {
      console.error('Etkinlik reddedilirken genel hata:', error)
    }
  }

  async function deactivateEvent(id: string) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://fbiibwhupuxizqacvhdt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaWlid2h1cHV4aXpxYWN2aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8QZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
      )
      const { error } = await supabase.from('events').update({ status: 'inactive' }).eq('id', id)
      
      if (error) {
        console.error('Etkinlik pasif yapılırken hata:', error)
        return
      }
      
      // UI'yi güncelle
      setEvents(events.map(event => 
        event.id === id ? { ...event, status: 'inactive' } : event
      ))
    } catch (error) {
      console.error('Etkinlik pasif yapılırken genel hata:', error)
    }
  }

  if (loading) {
    return (
      <main>
        <h1>Etkinlik Yönetimi</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Etkinlikler yükleniyor...</div>
        </div>
      </main>
    )
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
                          <button 
                            onClick={() => approveEvent(event.id)}
                            className="btn btn-success btn-sm"
                          >
                            Onayla
                          </button>
                          <button 
                            onClick={() => rejectEvent(event.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Reddet
                          </button>
                        </>
                      )}
                      
                      {event.status === 'approved' && (
                        <button 
                          onClick={() => deactivateEvent(event.id)}
                          className="btn btn-warning btn-sm"
                        >
                          Pasif Yap
                        </button>
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