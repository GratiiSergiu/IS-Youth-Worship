import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eaxdagcogplnnearvizy.supabase.co'
const supabaseAnonKey = 'AICI_STERGE_ACEST_TEXT_SI_LIPESTE_CHEIA_TA_LUNGA_DE_PE_SUPABASE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
