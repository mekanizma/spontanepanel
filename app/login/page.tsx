import { redirect } from 'next/navigation'
import { getActionSupabase, getServerSupabase } from '@/lib/supabaseServer'

export default async function LoginPage() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  if (data.user) redirect('/dashboard')

  async function login(formData: FormData) {
    'use server'
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')
    const supa = await getActionSupabase()
    const { error } = await supa.auth.signInWithPassword({ email, password })
    if (error) {
      return { ok: false, message: 'Giriş başarısız' }
    }
    return redirect('/dashboard')
  }

  async function logout() {
    'use server'
    const supa = await getActionSupabase()
    await supa.auth.signOut()
    return redirect('/login')
  }

  return (
    <main style={{ padding: 24, maxWidth: 400 }}>
      <h1>Admin Giriş</h1>
      <form action={login} style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        <input type="email" name="email" placeholder="E-posta" required />
        <input type="password" name="password" placeholder="Şifre" required />
        <button type="submit">Giriş Yap</button>
      </form>
      <form action={logout} style={{ marginTop: 16 }}>
        <button type="submit">Oturumu Kapat</button>
      </form>
    </main>
  )
}


