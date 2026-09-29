import { createClient } from '@supabase/supabase-js'

// Le variabili Vercel hanno priorità. I valori pubblici di fallback
// permettono anche alle anteprime di compilare se le variabili non sono
// ancora configurate nel progetto Vercel.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://rkwqmteuxpdgdhgowbpn.supabase.co'

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_fl3jgQp7nsP90RRD8Ji21g_ZtTyQAXn'

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)
