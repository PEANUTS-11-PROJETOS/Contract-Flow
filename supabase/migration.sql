-- Migração: adiciona campos para o modelo de renovação de contratos
-- Execute este script no Supabase SQL Editor

ALTER TABLE public.contratos
  ADD COLUMN IF NOT EXISTS tipo text,
  ADD COLUMN IF NOT EXISTS periodicidade text
    CONSTRAINT contratos_periodicidade_check
    CHECK (periodicidade IN ('mensal', 'unico') OR periodicidade IS NULL),
  ADD COLUMN IF NOT EXISTS data_inicio date,
  ADD COLUMN IF NOT EXISTS data_renovacao date,
  ADD COLUMN IF NOT EXISTS alerta_dias integer DEFAULT 7;

-- Índice para consultas de alerta de vencimento
CREATE INDEX IF NOT EXISTS contratos_data_renovacao_idx
  ON public.contratos (user_id, data_renovacao)
  WHERE data_renovacao IS NOT NULL;
