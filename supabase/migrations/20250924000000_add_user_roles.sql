-- Create an enum type for user roles
CREATE TYPE public.user_role AS ENUM ('eletrica', 'fornecedor');

-- Add role column to auth.users
ALTER TABLE auth.users ADD COLUMN role public.user_role DEFAULT 'eletrica';

-- Create a secure view for user profiles
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
  id,
  role,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users;

-- Set up RLS policies for profiles
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Set up RLS policies for orders based on role
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  fornecedor_id UUID REFERENCES auth.users(id),
  produto_id UUID REFERENCES public.estoque(id),
  quantidade INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fornecedores can view their orders"
  ON public.pedidos
  FOR SELECT
  USING (
    auth.uid() = fornecedor_id AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND role = 'fornecedor'
    )
  );

-- Add RLS policy for estoque table based on role
CREATE POLICY "Eletrica can view and edit stock"
  ON public.estoque
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND role = 'eletrica'
    )
  );

CREATE POLICY "Fornecedores can view stock"
  ON public.estoque
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND role = 'fornecedor'
    )
  );