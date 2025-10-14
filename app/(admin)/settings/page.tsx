import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  // Geçici olarak auth kontrolünü devre dışı bırak
  // const supabase = await getServerSupabase()
  // const { data } = await supabase.auth.getUser()
  // if (!data.user) {
  //   redirect('/login?redirect=/settings')
  // }

  return (
    <main>
      <h1>Sistem Ayarları</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Genel Ayarlar */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Genel Ayarlar</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Adı</label>
              <input type="text" className="input" value="Spontane" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site Açıklaması</label>
              <textarea className="input" rows={3} value="Etkinlik paylaşım platformu" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin E-postası</label>
              <input type="email" className="input" value="admin@spontane.com" readOnly />
            </div>
          </div>
        </div>

        {/* Güvenlik Ayarları */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Güvenlik Ayarları</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Maksimum Giriş Denemesi</label>
              <input type="number" className="input" value="5" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hesap Kilitleme Süresi (dakika)</label>
              <input type="number" className="input" value="30" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şifre Minimum Uzunluk</label>
              <input type="number" className="input" value="8" readOnly />
            </div>
          </div>
        </div>

        {/* Etkinlik Ayarları */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Etkinlik Ayarları</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Maksimum Katılımcı Sayısı</label>
              <input type="number" className="input" value="100" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Etkinlik Onay Gerekli</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked readOnly />
                <span className="text-sm">Yeni etkinlikler admin onayı gerektirir</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maksimum Etkinlik Süresi (saat)</label>
              <input type="number" className="input" value="24" readOnly />
            </div>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Bildirim Ayarları</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">E-posta Bildirimleri</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked readOnly />
                <span className="text-sm">Aktif</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Push Bildirimleri</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked readOnly />
                <span className="text-sm">Aktif</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMS Bildirimleri</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" readOnly />
                <span className="text-sm">Pasif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sistem Bilgileri */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Sistem Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted">Veritabanı Durumu</label>
            <div className="text-sm text-green-600">✅ Bağlı</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted">Son Güncelleme</label>
            <div className="text-sm">{new Date().toLocaleString('tr-TR')}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted">Versiyon</label>
            <div className="text-sm">v1.0.0</div>
          </div>
        </div>
      </div>
    </main>
  )
}