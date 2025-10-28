import { createClient } from '@supabase/supabase-js'

// Service Role Key ile Supabase client oluştur
export function createServiceSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASEKEY! // Netlify'da tanımlı service role key
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Service client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASEKEY environment variables.'
    )
  }
  
  console.log('🔑 Service Role Key ile Supabase client oluşturuluyor...')
  console.log('🔑 SUPABASE_URL:', supabaseUrl)
  console.log('🔑 SERVICE_KEY:', supabaseServiceKey ? 'var' : 'yok')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  console.log('🔑 Service Role Supabase client oluşturuldu')
  return supabase
}

// Client-side için service role key kullanımı
export async function getServiceSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASEKEY!
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Service client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASEKEY environment variables.'
    )
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}


