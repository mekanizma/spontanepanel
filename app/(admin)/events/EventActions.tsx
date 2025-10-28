'use client'

interface EventActionsProps {
  eventId: string
  status: string
}

export default function EventActions({ eventId, status }: EventActionsProps) {
  const handleToggleStatus = async () => {
    const isClosing = status !== 'inactive'
    const actionText = isClosing ? 'kapatmak' : 'açmak'
    
    if (!confirm(`Bu etkinliği ${actionText} istediğinizden emin misiniz?`)) {
      return
    }
    
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isClosing ? 'close' : 'open',
          eventId: eventId
        })
      })
      
      if (!res.ok) {
        throw new Error('Request failed')
      }
      
      const resultText = isClosing ? 'kapatıldı' : 'açıldı'
      alert(`Etkinlik başarıyla ${resultText}`)
      window.location.reload()
    } catch (error) {
      console.error('Etkinlik durumu değiştirilirken hata:', error)
      alert('Etkinlik durumu değiştirilirken hata oluştu')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }
    
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          eventId: eventId
        })
      })
      
      if (!res.ok) {
        throw new Error('Request failed')
      }
      
      alert('Etkinlik başarıyla silindi')
      window.location.reload()
    } catch (error) {
      console.error('Etkinlik silinirken hata:', error)
      alert('Etkinlik silinirken hata oluştu')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={handleToggleStatus}
        className={status === 'inactive' ? 'btn btn-success btn-sm' : 'btn btn-warning btn-sm'}
      >
        {status === 'inactive' ? 'Etkinliği Aç' : 'Etkinliği Kapat'}
      </button>
      <button 
        onClick={handleDelete}
        className="btn btn-danger btn-sm"
      >
        Etkinliği Sil
      </button>
    </div>
  )
}

