-- Saúde dos gateways PIX (histórico de health-checks).
create table if not exists gateway_health (
  id uuid primary key default gen_random_uuid(),
  gateway_id text not null,
  taxa_aprovacao_1h numeric(5,2) not null,
  latencia_media_ms integer not null,
  status text not null check (status in ('ok', 'degraded', 'down')),
  checked_at timestamptz not null default now()
);

create index if not exists gateway_health_lookup_idx on gateway_health (gateway_id, checked_at desc);

-- Colunas de roteamento na tabela de vendas existente (`sales` é a tabela real
-- deste projeto; o spec citava `transactions`).
alter table sales add column if not exists gateway_id text;
alter table sales add column if not exists gateway_fallback boolean default false;

-- O painel admin (dono autenticado) lê a saúde ao vivo via Realtime.
-- Escrita é só service_role (a função admin). Leitura: usuários autenticados.
alter table gateway_health enable row level security;

drop policy if exists "gateway_health read authenticated" on gateway_health;
create policy "gateway_health read authenticated"
  on gateway_health for select
  to authenticated
  using (true);

-- Habilita Realtime na tabela (ignora se já estiver na publicação).
do $$
begin
  begin
    alter publication supabase_realtime add table gateway_health;
  exception when duplicate_object then null;
  end;
end $$;
