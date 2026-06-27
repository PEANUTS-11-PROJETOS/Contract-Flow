-- Rodar no Supabase SQL Editor
-- Define conta admin como Pro permanente, sem trial

UPDATE public.profiles
SET
  plano            = 'pro',
  ativo            = true,
  trial_expires_at = NULL,
  plano_expires_at = NULL
WHERE email = 'soaresvinicius11112@gmail.com';
