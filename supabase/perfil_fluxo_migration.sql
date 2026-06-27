-- Execute no Supabase SQL Editor

-- 1. Adicionar nome ao perfil do usuário
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nome text;

-- 2. Adicionar fluxo ao contrato (receber = usuário presta serviço, pagar = usuário contrata)
ALTER TABLE public.contratos
ADD COLUMN IF NOT EXISTS fluxo text NOT NULL DEFAULT 'receber'
CHECK (fluxo IN ('receber', 'pagar'));
