import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getServerSupabase() {
  const cookieStore = await cookies()
  
  console.log('🔧 Supabase Server Client oluşturuluyor...')
  console.log('🔧 SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'var' : 'yok')
  console.log('🔧 SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'var' : 'yok')
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Your project\'s URL and Key are required to create a Supabase client!\n\n' +
      'Check your Supabase project\'s API settings to find these values\n\n' +
      'https://supabase.com/dashboard/project/_/settings/api'
    )
  }
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name)?.value
          console.log(`🍪 Server Cookie ${name}:`, cookie ? 'var' : 'yok')
          return cookie
        },
      },
    },
  )
  
  console.log('🔧 Supabase Server Client oluşturuldu')
  return supabase
}

// Server Action / Route Handler için: cookie set/sil desteği
export async function getActionSupabase() {
  const cookieStore = await cookies()
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Your project\'s URL and Key are required to create a Supabase client!\n\n' +
      'Check your Supabase project\'s API settings to find these values\n\n' +
      'https://supabase.com/dashboard/project/_/settings/api'
    )
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options })
        },
      },
    },
  )
  return supabase
}


