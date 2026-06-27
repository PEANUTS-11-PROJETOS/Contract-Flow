-- ============================================================
-- ContractFlow — Schema SQL
-- Execute no Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- CONTRATOS
-- ────────────────────────────────────────────────────────────
create table if not exists public.contratos (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,

  -- Dados do contrato
  titulo           text not null,
  descricao        text,
  status           text not null default 'proposta'
                     check (status in ('proposta', 'ativo', 'concluido', 'cancelado')),

  -- Cliente
  cliente_nome     text not null,
  cliente_email    text,
  cliente_telefone text,
  cliente_documento text,           -- CPF ou CNPJ

  -- Evento / serviço
  data_evento      date,
  local_evento     text,
  valor_total      numeric(12,2) not null default 0,

  -- Extras
  observacoes      text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contratos_updated_at
  before update on public.contratos
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- PAGAMENTOS
-- ────────────────────────────────────────────────────────────
create table if not exists public.pagamentos (
  id               uuid primary key default gen_random_uuid(),
  contrato_id      uuid not null references public.contratos(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,

  descricao        text,
  valor            numeric(12,2) not null,
  status           text not null default 'pendente'
                     check (status in ('pendente', 'pago', 'cancelado')),

  data_vencimento  date,
  data_pagamento   date,
  forma_pagamento  text
                     check (forma_pagamento in ('pix', 'dinheiro', 'cartao', 'transferencia', 'boleto')),

  created_at       timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
alter table public.contratos  enable row level security;
alter table public.pagamentos enable row level security;

-- Contratos: usuário vê e manipula apenas os seus
create policy "contratos_select" on public.contratos
  for select using (auth.uid() = user_id);

create policy "contratos_insert" on public.contratos
  for insert with check (auth.uid() = user_id);

create policy "contratos_update" on public.contratos
  for update using (auth.uid() = user_id);

create policy "contratos_delete" on public.contratos
  for delete using (auth.uid() = user_id);

-- Pagamentos: usuário vê e manipula apenas os seus
create policy "pagamentos_select" on public.pagamentos
  for select using (auth.uid() = user_id);

create policy "pagamentos_insert" on public.pagamentos
  for insert with check (auth.uid() = user_id);

create policy "pagamentos_update" on public.pagamentos
  for update using (auth.uid() = user_id);

create policy "pagamentos_delete" on public.pagamentos
  for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- ÍNDICES
-- ────────────────────────────────────────────────────────────
create index contratos_user_id_idx      on public.contratos(user_id);
create index contratos_status_idx       on public.contratos(status);
create index contratos_data_evento_idx  on public.contratos(data_evento);
create index pagamentos_contrato_id_idx on public.pagamentos(contrato_id);
create index pagamentos_status_idx      on public.pagamentos(status);
