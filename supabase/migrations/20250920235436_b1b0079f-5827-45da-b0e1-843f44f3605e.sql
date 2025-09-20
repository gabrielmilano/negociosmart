-- Sistema multi-tenant com ambientes e tokens
-- Adicionar campos para tipos de empresa e ambientes

-- Atualizar tabela empresas para suportar tipos (fornecedor/loja)
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS tipo_empresa text DEFAULT 'fornecedor' CHECK (tipo_empresa IN ('fornecedor', 'loja'));

-- Criar tabela de ambientes por empresa
CREATE TABLE IF NOT EXISTS public.ambientes_empresa (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id uuid NOT NULL,
  nome text NOT NULL CHECK (nome IN ('desenvolvimento', 'homologacao', 'producao')),
  descricao text,
  ativo boolean DEFAULT true,
  configuracoes jsonb DEFAULT '{}',
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- Criar tabela de tokens por ambiente
CREATE TABLE IF NOT EXISTS public.tokens_ambiente (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambiente_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  nome text NOT NULL,
  tipo text DEFAULT 'api' CHECK (tipo IN ('api', 'webhook', 'integacao')),
  permissoes jsonb DEFAULT '{"read": true, "write": false}',
  expires_at timestamp with time zone,
  ultimo_uso timestamp with time zone,
  ativo boolean DEFAULT true,
  criado_por uuid NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  UNIQUE(ambiente_id, nome)
);

-- Criar tabela de relacionamentos entre empresas (fornecedor-loja)
CREATE TABLE IF NOT EXISTS public.relacionamentos_empresa (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor_id uuid NOT NULL,
  loja_id uuid NOT NULL,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'inativo', 'rejeitado')),
  permissoes jsonb DEFAULT '{"visualizar_estoque": true, "visualizar_precos": false, "fazer_pedidos": false}',
  observacoes text,
  criado_em timestamp with time zone DEFAULT now(),
  aprovado_em timestamp with time zone,
  aprovado_por uuid,
  UNIQUE(fornecedor_id, loja_id)
);

-- Enable RLS
ALTER TABLE public.ambientes_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens_ambiente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relacionamentos_empresa ENABLE ROW LEVEL SECURITY;

-- RLS Policies para ambientes_empresa
CREATE POLICY "Users can view environments from their companies"
ON public.ambientes_empresa FOR SELECT
USING (
  empresa_id IN (
    SELECT usuarios_empresa.empresa_id
    FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id
    FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

CREATE POLICY "Users can insert environments in their companies"
ON public.ambientes_empresa FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT usuarios_empresa.empresa_id
    FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id
    FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

CREATE POLICY "Users can update environments in their companies"
ON public.ambientes_empresa FOR UPDATE
USING (
  empresa_id IN (
    SELECT usuarios_empresa.empresa_id
    FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id
    FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

-- RLS Policies para tokens_ambiente
CREATE POLICY "Users can view tokens from their company environments"
ON public.tokens_ambiente FOR SELECT
USING (
  ambiente_id IN (
    SELECT ae.id
    FROM ambientes_empresa ae
    WHERE ae.empresa_id IN (
      SELECT usuarios_empresa.empresa_id
      FROM usuarios_empresa
      WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
      UNION
      SELECT empresas.id
      FROM empresas
      WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
    )
  )
);

CREATE POLICY "Users can insert tokens in their company environments"
ON public.tokens_ambiente FOR INSERT
WITH CHECK (
  ambiente_id IN (
    SELECT ae.id
    FROM ambientes_empresa ae
    WHERE ae.empresa_id IN (
      SELECT usuarios_empresa.empresa_id
      FROM usuarios_empresa
      WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
      UNION
      SELECT empresas.id
      FROM empresas
      WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
    )
  ) AND criado_por = auth.uid()
);

CREATE POLICY "Users can update tokens in their company environments"
ON public.tokens_ambiente FOR UPDATE
USING (
  ambiente_id IN (
    SELECT ae.id
    FROM ambientes_empresa ae
    WHERE ae.empresa_id IN (
      SELECT usuarios_empresa.empresa_id
      FROM usuarios_empresa
      WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
      UNION
      SELECT empresas.id
      FROM empresas
      WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
    )
  )
);

-- RLS Policies para relacionamentos_empresa
CREATE POLICY "Fornecedores veem seus relacionamentos"
ON public.relacionamentos_empresa FOR SELECT
USING (
  fornecedor_id IN (
    SELECT usuarios_empresa.empresa_id
    FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id
    FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

CREATE POLICY "Lojas veem seus relacionamentos"
ON public.relacionamentos_empresa FOR SELECT
USING (
  loja_id IN (
    SELECT usuarios_empresa.empresa_id
    FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id
    FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

CREATE POLICY "Lojas podem solicitar relacionamento"
ON public.relacionamentos_empresa FOR INSERT
WITH CHECK (
  loja_id IN (
    SELECT usuarios_empresa.empresa_id
    FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id
    FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

CREATE POLICY "Fornecedores podem atualizar relacionamentos"
ON public.relacionamentos_empresa FOR UPDATE
USING (
  fornecedor_id IN (
    SELECT usuarios_empresa.empresa_id
    FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id
    FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

-- Criar ambientes padrão para empresas existentes
INSERT INTO public.ambientes_empresa (empresa_id, nome, descricao)
SELECT 
  id,
  'producao',
  'Ambiente de produção'
FROM public.empresas
WHERE NOT EXISTS (
  SELECT 1 FROM public.ambientes_empresa 
  WHERE empresa_id = empresas.id AND nome = 'producao'
);

INSERT INTO public.ambientes_empresa (empresa_id, nome, descricao)
SELECT 
  id,
  'desenvolvimento',
  'Ambiente de desenvolvimento'
FROM public.empresas
WHERE NOT EXISTS (
  SELECT 1 FROM public.ambientes_empresa 
  WHERE empresa_id = empresas.id AND nome = 'desenvolvimento'
);

-- Trigger para criar ambientes padrão ao criar empresa
CREATE OR REPLACE FUNCTION public.create_default_environments_for_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Criar ambiente de produção
    INSERT INTO public.ambientes_empresa (empresa_id, nome, descricao)
    VALUES (NEW.id, 'producao', 'Ambiente de produção');
    
    -- Criar ambiente de desenvolvimento
    INSERT INTO public.ambientes_empresa (empresa_id, nome, descricao)
    VALUES (NEW.id, 'desenvolvimento', 'Ambiente de desenvolvimento');
    
    RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela empresas
DROP TRIGGER IF EXISTS trigger_create_default_environments ON public.empresas;
CREATE TRIGGER trigger_create_default_environments
AFTER INSERT ON public.empresas
FOR EACH ROW
EXECUTE FUNCTION public.create_default_environments_for_company();

-- Função para gerar tokens únicos
CREATE OR REPLACE FUNCTION public.generate_api_token()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    token_value text;
BEGIN
    -- Gerar token com prefixo e UUID
    token_value := 'est_' || replace(gen_random_uuid()::text, '-', '');
    RETURN token_value;
END;
$$;

-- Trigger para gerar token automaticamente
CREATE OR REPLACE FUNCTION public.auto_generate_token()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.token IS NULL OR NEW.token = '' THEN
        NEW.token := public.generate_api_token();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_token
BEFORE INSERT ON public.tokens_ambiente
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_token();

-- Atualizar trigger updated_at para novas tabelas
CREATE TRIGGER update_ambientes_empresa_updated_at
BEFORE UPDATE ON public.ambientes_empresa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Política para lojas visualizarem produtos de fornecedores relacionados
CREATE POLICY "Lojas veem produtos de fornecedores relacionados"
ON public.produtos FOR SELECT
USING (
  empresa_id IN (
    SELECT r.fornecedor_id
    FROM relacionamentos_empresa r
    WHERE r.loja_id IN (
      SELECT usuarios_empresa.empresa_id
      FROM usuarios_empresa
      WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
      UNION
      SELECT empresas.id
      FROM empresas
      WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
    )
    AND r.status = 'ativo'
    AND (r.permissoes->>'visualizar_estoque')::boolean = true
  )
);