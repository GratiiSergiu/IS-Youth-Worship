import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eaxdagcogplnnearvizy.supabase.co'
const supabaseAnonKey = 'sb_publishable_nEv0VIbiPbbair2ncl58IQ_LdU556Si'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
