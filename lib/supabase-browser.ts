import { createClient } from '@supabase/supabase-js'

function requirePublicEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`)
  }

  return value
}

export const supabaseBrowser = createClient(
  requirePublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requirePublicEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
)
