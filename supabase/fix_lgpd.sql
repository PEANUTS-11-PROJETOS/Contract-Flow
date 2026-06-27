-- ============================================================
-- Fix de segurança / LGPD — Execute no Supabase SQL Editor
-- ============================================================

-- 1. Tornar bucket de arquivos PRIVADO
--    Arquivos contêm contratos, CPF/CNPJ e comprovantes (dados pessoais)
UPDATE storage.buckets
SET public = false
WHERE id = 'arquivos';

-- 2. Verificar se RLS está ativo em todas as tabelas (já deve estar)
ALTER TABLE public.contratos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;

-- 3. Garantir que profiles não tem política de INSERT aberta
--    (apenas o trigger handle_new_user deve criar perfis)
DROP POLICY IF EXISTS "profiles_insert_any" ON public.profiles;

-- 4. Confirmar policies de storage corretas
-- SELECT: apenas arquivos do próprio user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'acesso_proprio'
  ) THEN
    CREATE POLICY "acesso_proprio" ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'arquivos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
