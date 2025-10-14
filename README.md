# Spontane Admin Panel

Spontane etkinlik platformu için admin yönetim paneli.

## Özellikler

- 🔐 **Güvenli Giriş**: Sadece yetkili admin kullanıcıları giriş yapabilir
- 👥 **Kullanıcı Yönetimi**: Kullanıcıları görüntüleme, askıya alma, silme
- 🎉 **Etkinlik Yönetimi**: Etkinlikleri onaylama, reddetme, pasif yapma
- 📊 **Dashboard**: Sistem istatistikleri ve genel bakış
- 🔔 **Bildirim Yönetimi**: Kullanıcılara bildirim gönderme
- ⭐ **Premium Yönetimi**: Premium kullanıcıları yönetme
- ✅ **Doğrulama Yönetimi**: Kullanıcı doğrulama isteklerini yönetme
- ⚙️ **Sistem Ayarları**: Genel sistem konfigürasyonu

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment variables'ları ayarlayın:
```bash
# .env.local dosyası oluşturun
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Production build:
```bash
npm run build
npm start
```

## Admin Erişimi

Sadece aşağıdaki e-posta adresleri admin paneline erişebilir:
- admin@spontane.com
- yildirim@spontane.com

Yeni admin e-postaları `middleware.ts` dosyasındaki `adminEmails` dizisine eklenebilir.

## Güvenlik

- Tüm admin sayfaları middleware ile korunur
- Sadece yetkili e-postalar giriş yapabilir
- Supabase RLS (Row Level Security) ile veri güvenliği
- Server-side authentication kontrolü

## Teknolojiler

- **Next.js 14**: React framework
- **TypeScript**: Tip güvenliği
- **Supabase**: Veritabanı ve authentication
- **Tailwind CSS**: Styling (custom CSS ile)
- **Server Actions**: Form işlemleri

## Sayfalar

- `/` - Ana sayfa (giriş yapmamış kullanıcılar için)
- `/login` - Admin giriş sayfası
- `/dashboard` - Ana dashboard
- `/users` - Kullanıcı yönetimi
- `/events` - Etkinlik yönetimi
- `/reports` - Şikayet yönetimi
- `/notifications` - Bildirim yönetimi
- `/premium` - Premium kullanıcı yönetimi
- `/verification` - Doğrulama yönetimi
- `/badges` - Rozet yönetimi (yakında)
- `/stories` - Hikaye yönetimi (yakında)
- `/settings` - Sistem ayarları

## Geliştirme

Proje yapısı:
```
spontanepanel/
├── app/
│   ├── (admin)/          # Admin sayfaları
│   ├── login/            # Giriş sayfası
│   ├── globals.css       # Global stiller
│   └── layout.tsx        # Ana layout
├── lib/
│   └── supabaseServer.ts # Supabase server client
├── middleware.ts         # Auth middleware
└── package.json
```

## Production Deployment

1. Environment variables'ları production ortamında ayarlayın
2. `npm run build` ile production build oluşturun
3. `npm start` ile production sunucusunu başlatın
4. Veya Netlify, Vercel gibi platformlara deploy edin

## Notlar

- Tüm veritabanı işlemleri error handling ile korunmuştur
- Responsive tasarım mobil uyumludur
- Production için optimize edilmiştir