-- Roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Grant admin to the existing owner account
INSERT INTO public.user_roles (user_id, role)
VALUES ('1af0c3b8-35a5-4e35-8037-56c6426c50cf', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Stamps library
CREATE TABLE public.stamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  svg text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.stamps TO anon, authenticated;
GRANT ALL ON public.stamps TO service_role;

ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stamps"
ON public.stamps FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert stamps"
ON public.stamps FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete stamps"
ON public.stamps FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));