-- Purchase Intent Score: score final por sessão de checkout (analytics).
create table if not exists intent_scores (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  checkout_id text,
  final_score integer not null,
  events jsonb not null default '[]'::jsonb,
  converteu boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists intent_scores_checkout_idx on intent_scores (checkout_id, created_at desc);

-- O checkout é público: o comprador (anon) só pode INSERIR o próprio score.
-- Nunca há SELECT público (sem policy de select = leitura bloqueada p/ anon).
alter table intent_scores enable row level security;

drop policy if exists "intent_scores insert public" on intent_scores;
create policy "intent_scores insert public"
  on intent_scores for insert
  to anon, authenticated
  with check (true);
