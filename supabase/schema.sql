-- ============================================================
-- AZ Checkout — schema do banco (Supabase / Postgres)
-- Rode no Supabase: SQL Editor → cole tudo → Run.
-- Segurança: RLS ligada em todas as tabelas; cada usuário só vê o que é dele.
-- ============================================================

-- Perfil (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar text,
  plan text default 'start',
  security boolean default false,
  domain text default '',
  is_owner boolean default false,
  created_at timestamptz default now()
);

-- Produtos do vendedor (config do checkout em JSONB)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  name text not null,
  amount numeric default 0,
  old_amount numeric,
  image text,
  status text default 'Ativo',
  bravo_product_id text,
  checkout jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (owner, slug)
);

-- Vendas / pedidos
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  product_slug text,
  customer jsonb default '{}'::jsonb,   -- nome, email, telefone, cpf, endereço
  items jsonb default '[]'::jsonb,      -- front, order bump, upsell...
  total numeric default 0,
  status text default 'aguardando',     -- aguardando | pago | expirado | reembolsado
  method text,
  proof text,                            -- URL do comprovante (Storage)
  created_at timestamptz default now()
);

-- Eventos do Livex (métricas 24h/7d/30d)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  product text,
  outcome text,         -- paid | abandoned
  amount numeric default 0,
  step text,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS — cada usuário só acessa as próprias linhas
-- ============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.sales    enable row level security;
alter table public.events   enable row level security;

drop policy if exists "perfil proprio" on public.profiles;
create policy "perfil proprio" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "produtos do dono" on public.products;
create policy "produtos do dono" on public.products
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

drop policy if exists "vendas do dono" on public.sales;
create policy "vendas do dono" on public.sales
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

drop policy if exists "eventos do dono" on public.events;
create policy "eventos do dono" on public.events
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

-- Leitura pública de produtos para o checkout (página do comprador).
drop policy if exists "produtos publicos (checkout)" on public.products;
create policy "produtos publicos (checkout)" on public.products
  for select using (true);

-- OBS: o painel do DONO (ver todas as contas/faturamento) é feito por uma
-- função serverless usando a service_role key (bypassa a RLS com segurança),
-- nunca no navegador.

-- Cria o perfil automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
