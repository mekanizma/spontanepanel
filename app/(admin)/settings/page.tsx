import { getServerSupabase } from '@/lib/supabaseServer'

export default async function SettingsPage() {
  async function save(formData: FormData) {
    'use server'
    const key = String(formData.get('key'))
    const value = String(formData.get('value'))
    const supabase = await getServerSupabase()
    await supabase.from('system_settings').upsert({ key, value })
  }

  return (
    <main>
      <h1>Sistem Ayarları</h1>
      <form action={save} style={{ display: 'grid', gap: 8, maxWidth: 520, marginTop: 16 }}>
        <input name="key" placeholder="Ayar anahtarı (ör: max_events_per_month)" required />
        <input name="value" placeholder="Değer" required />
        <button type="submit">Kaydet</button>
      </form>
    </main>
  )
}


