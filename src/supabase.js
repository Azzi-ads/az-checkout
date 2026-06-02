import { createClient } from '@supabase/supabase-js'

// Chaves públicas do projeto (a anon key é feita para ficar no front; a RLS protege os dados).
// Podem ser sobrescritas por env vars no Vercel se quiser.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://wgzihgfavsboezhrgqck.supabase.co'
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnemloZ2ZhdnNib2V6aHJncWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDA4MzMsImV4cCI6MjA5NTk3NjgzM30.WDlydBTpzpcyMDSCfCawXu6EaSRxqUQYdxbaExXpvVc'

export const supabase = url && anon ? createClient(url, anon) : null
export const hasBackend = !!supabase
