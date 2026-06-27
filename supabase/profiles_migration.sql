-- Rodar no Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email                  text,
  plano                  text        NOT NULL DEFAULT 'gratuito'
                                     CHECK (plano IN ('gratuito', 'pro')),
  ativo                  boolean     NOT NULL DEFAULT true,
  stripe_customer_id     text,
  stripe_subscription_id text,
  trial_expires_at       timestamptz DEFAULT (now() + interval '15 days'),
  plano_expires_at       timestamptz,
  created_at             timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill para usuários já existentes
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
