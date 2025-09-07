-- Create usuarios table for user profiles
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  avatar_url TEXT,
  plano TEXT NOT NULL DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'pro', 'enterprise')),
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  limites JSONB NOT NULL DEFAULT '{"automacoes": 5, "webhooks": 10, "execucoes_mes": 1000}',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ultimo_acesso TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Create policies for usuarios table
CREATE POLICY "Users can view their own profile" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create automacoes table
CREATE TABLE public.automacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  nome TEXT NOT NULL,
  categoria TEXT,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'erro')),
  webhook TEXT NOT NULL,
  token TEXT NOT NULL,
  configuracao JSONB DEFAULT '{}',
  metricas JSONB DEFAULT '{}',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automacoes ENABLE ROW LEVEL SECURITY;

-- Create policies for automacoes table
CREATE POLICY "Users can view their own automations" 
ON public.automacoes 
FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own automations" 
ON public.automacoes 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own automations" 
ON public.automacoes 
FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own automations" 
ON public.automacoes 
FOR DELETE 
USING (auth.uid() = usuario_id);

-- Create webhooks table
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'erro')),
  configuracao JSONB DEFAULT '{}',
  metricas JSONB DEFAULT '{}',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies for webhooks table
CREATE POLICY "Users can view their own webhooks" 
ON public.webhooks 
FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own webhooks" 
ON public.webhooks 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own webhooks" 
ON public.webhooks 
FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own webhooks" 
ON public.webhooks 
FOR DELETE 
USING (auth.uid() = usuario_id);

-- Create logs_webhook table
CREATE TABLE public.logs_webhook (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  request_data JSONB,
  response_data JSONB,
  ip_address TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.logs_webhook ENABLE ROW LEVEL SECURITY;

-- Create policies for logs_webhook table
CREATE POLICY "Users can view their own webhook logs" 
ON public.logs_webhook 
FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own webhook logs" 
ON public.logs_webhook 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on automacoes
CREATE TRIGGER update_automacoes_updated_at
  BEFORE UPDATE ON public.automacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();