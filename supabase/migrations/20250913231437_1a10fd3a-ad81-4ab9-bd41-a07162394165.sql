-- ====================
-- ESTRUTURA COMPLETA DO SISTEMA DE ESTOQUE
-- ====================

-- Atualizar tabela de empresas
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS tipo_negocio TEXT NOT NULL DEFAULT 'geral',
ADD COLUMN IF NOT EXISTS cnpj_cpf TEXT,
ADD COLUMN IF NOT EXISTS endereco JSONB,
ADD COLUMN IF NOT EXISTS configuracoes JSONB DEFAULT '{
  "moeda": "BRL",
  "alertas": {
    "estoque_minimo": true,
    "produto_vencendo": true,
    "ruptura_estoque": true
  },
  "categorias_padrao": [],
  "campos_personalizados": []
}'::jsonb,
ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'gratuito',
ADD COLUMN IF NOT EXISTS limites JSONB DEFAULT '{
  "produtos": 100,
  "movimentacoes_mes": 1000,
  "usuarios": 3
}'::jsonb;

-- Atualizar tabela de categorias
ALTER TABLE public.categorias_produto 
ADD COLUMN IF NOT EXISTS categoria_pai_id UUID REFERENCES public.categorias_produto(id);

-- Atualizar tabela de fornecedores
ALTER TABLE public.fornecedores
ADD COLUMN IF NOT EXISTS contato JSONB DEFAULT '{
  "telefone": "",
  "email": "",
  "endereco": "",
  "pessoa_contato": ""
}'::jsonb;

-- Atualizar tabela de produtos com campos completos
ALTER TABLE public.produtos
ADD COLUMN IF NOT EXISTS margem_lucro DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS unidade_medida TEXT DEFAULT 'UN',
ADD COLUMN IF NOT EXISTS localizacao JSONB DEFAULT '{
  "setor": "",
  "prateleira": "",
  "posicao": ""
}'::jsonb,
ADD COLUMN IF NOT EXISTS peso DECIMAL(8,3),
ADD COLUMN IF NOT EXISTS dimensoes JSONB DEFAULT '{
  "altura": null,
  "largura": null,
  "profundidade": null
}'::jsonb,
ADD COLUMN IF NOT EXISTS data_validade DATE,
ADD COLUMN IF NOT EXISTS data_ultima_entrada TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_ultima_saida TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS campos_extras JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS imagens TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Atualizar tabela de movimentações
ALTER TABLE public.movimentacoes_estoque
ADD COLUMN IF NOT EXISTS subtipo TEXT,
ADD COLUMN IF NOT EXISTS documento_numero TEXT,
ADD COLUMN IF NOT EXISTS documento_tipo TEXT,
ADD COLUMN IF NOT EXISTS fornecedor_cliente TEXT,
ADD COLUMN IF NOT EXISTS valor_unitario DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10,2);

-- Criar tabela de inventários se não existir
CREATE TABLE IF NOT EXISTS public.inventarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'finalizado', 'cancelado')),
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  responsavel_id UUID REFERENCES auth.users(id) NOT NULL,
  categoria_ids UUID[] DEFAULT ARRAY[]::UUID[],
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de itens do inventário se não existir
CREATE TABLE IF NOT EXISTS public.inventario_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventario_id UUID REFERENCES public.inventarios(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  quantidade_sistema INTEGER NOT NULL,
  quantidade_contada INTEGER,
  diferenca INTEGER GENERATED ALWAYS AS (quantidade_contada - quantidade_sistema) STORED,
  observacoes TEXT,
  contado_por UUID REFERENCES auth.users(id),
  data_contagem TIMESTAMP WITH TIME ZONE,
  UNIQUE(inventario_id, produto_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras ON public.produtos(codigo_barras) WHERE codigo_barras IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_estoque_minimo ON public.produtos(empresa_id, estoque_minimo) WHERE estoque_atual <= estoque_minimo;
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON public.movimentacoes_estoque(empresa_id, data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON public.movimentacoes_estoque(empresa_id, tipo);

-- RLS para novas tabelas
ALTER TABLE public.inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_itens ENABLE ROW LEVEL SECURITY;

-- Políticas para inventários
CREATE POLICY "Usuários veem inventários de suas empresas" ON public.inventarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_empresa ue 
      WHERE ue.empresa_id = inventarios.empresa_id 
      AND ue.usuario_id = auth.uid() 
      AND ue.ativo = true
    )
  );

CREATE POLICY "Usuários podem criar inventários em suas empresas" ON public.inventarios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios_empresa ue 
      WHERE ue.empresa_id = inventarios.empresa_id 
      AND ue.usuario_id = auth.uid() 
      AND ue.ativo = true
    )
  );

-- Políticas para itens de inventário
CREATE POLICY "Usuários veem itens de inventários de suas empresas" ON public.inventario_itens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.inventarios i
      JOIN public.usuarios_empresa ue ON ue.empresa_id = i.empresa_id
      WHERE i.id = inventario_itens.inventario_id
      AND ue.usuario_id = auth.uid() 
      AND ue.ativo = true
    )
  );

-- Inserir políticas faltantes para movimentações
CREATE POLICY "Usuários podem inserir movimentações em suas empresas" ON public.movimentacoes_estoque
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios_empresa ue 
      WHERE ue.empresa_id = movimentacoes_estoque.empresa_id 
      AND ue.usuario_id = auth.uid() 
      AND ue.ativo = true
      AND (ue.permissoes->'estoque'->>'entrada')::boolean = true
      OR (ue.permissoes->'estoque'->>'saida')::boolean = true
      OR (ue.permissoes->'estoque'->>'ajuste')::boolean = true
    )
  );