import { createClient } from '@supabase/supabase-js'

// Liga o backend só quando as variáveis existem (no Vercel). Sem elas, o app
// continua funcionando no localStorage (modo atual). Assim a migração é segura
// e progressiva.
const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anon ? createClient(url, anon) : null
export const hasBackend = !!supabase
