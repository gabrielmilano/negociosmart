-- Sistema multi-tenant simplificado com ambientes e tokens

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

-- Enable RLS para novas tabelas
ALTER TABLE public.ambientes_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens_ambiente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relacionamentos_empresa ENABLE ROW LEVEL SECURITY;

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

-- Criar triggers apenas se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_generate_token') THEN
        CREATE TRIGGER trigger_auto_generate_token
        BEFORE INSERT ON public.tokens_ambiente
        FOR EACH ROW
        EXECUTE FUNCTION public.auto_generate_token();
    END IF;
END $$;

-- Políticas RLS para ambientes_empresa
CREATE POLICY "empresa_ambientes_select" ON public.ambientes_empresa FOR SELECT
USING (
  empresa_id IN (
    SELECT usuarios_empresa.empresa_id FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

CREATE POLICY "empresa_ambientes_insert" ON public.ambientes_empresa FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT usuarios_empresa.empresa_id FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

-- Políticas RLS para tokens_ambiente
CREATE POLICY "tokens_select" ON public.tokens_ambiente FOR SELECT
USING (
  ambiente_id IN (
    SELECT ae.id FROM ambientes_empresa ae
    WHERE ae.empresa_id IN (
      SELECT usuarios_empresa.empresa_id FROM usuarios_empresa
      WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
      UNION
      SELECT empresas.id FROM empresas
      WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
    )
  )
);

CREATE POLICY "tokens_insert" ON public.tokens_ambiente FOR INSERT
WITH CHECK (
  ambiente_id IN (
    SELECT ae.id FROM ambientes_empresa ae
    WHERE ae.empresa_id IN (
      SELECT usuarios_empresa.empresa_id FROM usuarios_empresa
      WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
      UNION
      SELECT empresas.id FROM empresas
      WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
    )
  ) AND criado_por = auth.uid()
);

-- Políticas RLS para relacionamentos_empresa
CREATE POLICY "relacionamentos_fornecedor_select" ON public.relacionamentos_empresa FOR SELECT
USING (
  fornecedor_id IN (
    SELECT usuarios_empresa.empresa_id FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

CREATE POLICY "relacionamentos_loja_select" ON public.relacionamentos_empresa FOR SELECT
USING (
  loja_id IN (
    SELECT usuarios_empresa.empresa_id FROM usuarios_empresa
    WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
    UNION
    SELECT empresas.id FROM empresas
    WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
  )
);

-- Política para lojas visualizarem produtos de fornecedores relacionados
CREATE POLICY "produtos_fornecedor_relacionado" ON public.produtos FOR SELECT
USING (
  empresa_id IN (
    SELECT r.fornecedor_id FROM relacionamentos_empresa r
    WHERE r.loja_id IN (
      SELECT usuarios_empresa.empresa_id FROM usuarios_empresa
      WHERE usuarios_empresa.usuario_id = auth.uid() AND usuarios_empresa.ativo = true
      UNION
      SELECT empresas.id FROM empresas
      WHERE empresas.usuario_proprietario_id = auth.uid() AND empresas.ativo = true
    )
    AND r.status = 'ativo'
    AND (r.permissoes->>'visualizar_estoque')::boolean = true
  )
);

-- Criar ambientes padrão para empresas existentes
INSERT INTO public.ambientes_empresa (empresa_id, nome, descricao)
SELECT id, 'producao', 'Ambiente de produção'
FROM public.empresas
WHERE NOT EXISTS (
  SELECT 1 FROM public.ambientes_empresa 
  WHERE empresa_id = empresas.id AND nome = 'producao'
);

INSERT INTO public.ambientes_empresa (empresa_id, nome, descricao)
SELECT id, 'desenvolvimento', 'Ambiente de desenvolvimento'
FROM public.empresas
WHERE NOT EXISTS (
  SELECT 1 FROM public.ambientes_empresa 
  WHERE empresa_id = empresas.id AND nome = 'desenvolvimento'
);