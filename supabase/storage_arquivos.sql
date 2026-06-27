-- 1. Criar bucket "arquivos" (execute no Supabase Dashboard > Storage > New Bucket)
-- Nome: arquivos | Public: true (para URLs diretas funcionarem)
-- OU execute via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'arquivos',
  'arquivos',
  true,
  20971520, -- 20 MB
  ARRAY['application/pdf','image/jpeg','image/png','image/webp',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS: usuário só sobe arquivos na própria pasta
CREATE POLICY "upload_proprio" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'arquivos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. RLS: usuário só lê/deleta arquivos da própria pasta
CREATE POLICY "acesso_proprio" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'arquivos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "delete_proprio" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'arquivos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
