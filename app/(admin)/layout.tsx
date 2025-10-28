'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import styles from './layout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/users', label: 'Kullanıcılar', icon: '👥' },
    { href: '/events', label: 'Etkinlikler', icon: '🎉' },
    { href: '/reports', label: 'Şikayetler', icon: '⚠️' },
    { href: '/notifications', label: 'Bildirimler', icon: '🔔' },
    { href: '/premium', label: 'Premium', icon: '⭐' },
    { href: '/verification', label: 'Doğrulama', icon: '✅' },
    { href: '/badges', label: 'Rozetler', icon: '🏆' },
    { href: '/stories', label: 'Hikayeler', icon: '📖' },
    { href: '/settings', label: 'Sistem Ayarları', icon: '⚙️' },
  ]

  return (
    <div className={styles.container}>
      <button 
        className={styles.mobileMenuButton}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>
      
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.brand}>Spontane Admin</div>
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={pathname === item.href ? styles.active : ''}
              onClick={() => setSidebarOpen(false)}
            >
              <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.logoutSection}>
          <button 
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            🚪 Çıkış Yap
          </button>
        </div>
      </aside>
      
      <section className={styles.content}>
        {children}
      </section>
    </div>
  )
}



