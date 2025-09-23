import Link from 'next/link'
import styles from './layout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Spontane Admin</div>
        <nav className={styles.nav}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/users">Kullanıcılar</Link>
          <Link href="/events">Etkinlikler</Link>
          <Link href="/reports">Şikayetler</Link>
          <Link href="/notifications">Bildirimler</Link>
          <Link href="/premium">Premium</Link>
          <Link href="/verification">Doğrulama</Link>
          <Link href="/badges">Rozetler</Link>
          <Link href="/stories">Hikayeler</Link>
          <Link href="/settings">Sistem Ayarları</Link>
        </nav>
      </aside>
      <section className={styles.content}>{children}</section>
    </div>
  )
}


