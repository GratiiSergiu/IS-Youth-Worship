import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eaxdagcogplnnearvizy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheGRhZ2NvZ3Bsbm5lYXJ2aXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NzQyNDUsImV4cCI6MjA5NTA1MDI0NX0.ZaQKlN5YjHw8x8_jCKUDHxBI-cKr3YJa72g358qwIdc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
})
