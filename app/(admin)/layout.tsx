'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import styles from './layout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      </aside>
      
      <section className={styles.content}>
        {children}
      </section>
    </div>
  )
}



