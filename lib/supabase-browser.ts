import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  throw new Error('Variável de ambiente ausente: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabasePublishableKey) {
  throw new Error('Variável de ambiente ausente: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
}

export const supabaseBrowser = createClient(
  supabaseUrl,
  supabasePublishableKey
)
