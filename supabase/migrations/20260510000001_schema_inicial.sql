-- ContractFlow — Schema Inicial

-- Usuários (1:1 com auth.users)
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  plano       TEXT NOT NULL DEFAULT 'starter',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,           -- ex: "Ensaio fotográfico", "Cerimonial casamento"
  cliente_nome  TEXT NOT NULL,
  cliente_email TEXT,
  cliente_tel   TEXT,
  valor_total   NUMERIC(12,2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'proposta', -- proposta | ativo | concluido | cancelado
  data_evento   DATE,
  descricao     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Pagamentos do contrato
CREATE TABLE IF NOT EXISTS pagamentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id   UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  usuario_id    UUID NOT NULL REFERENCES usuarios(id),
  descricao     TEXT,                    -- ex: "Entrada", "2ª parcela"
  valor         NUMERIC(12,2) NOT NULL,
  data_prevista DATE,
  data_pagamento DATE,
  status        TEXT NOT NULL DEFAULT 'pendente', -- pendente | pago
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos (PDFs e comprovantes)
CREATE TABLE IF NOT EXISTS documentos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  usuario_id  UUID NOT NULL REFERENCES usuarios(id),
  tipo        TEXT NOT NULL DEFAULT 'contrato', -- contrato | comprovante
  nome        TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE usuarios   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proprio" ON usuarios   USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "proprio" ON contratos  USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "proprio" ON pagamentos USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "proprio" ON documentos USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Trigger: criar usuário ao signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket para documentos
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false) ON CONFLICT DO NOTHING;

CREATE POLICY "usuario_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "usuario_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "usuario_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos' AND (storage.foldername(name))[1] = auth.uid()::text);
