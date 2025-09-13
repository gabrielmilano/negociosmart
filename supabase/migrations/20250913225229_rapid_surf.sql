-- ====================
-- SISTEMA DE ESTOQUE COMPLETO
-- ====================

-- Tabela de empresas/negócios
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_proprietario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    tipo_negocio TEXT NOT NULL, -- 'autoeletrica', 'mecanica', 'lavanderia', 'geral'
    cnpj_cpf TEXT,
    endereco JSONB,
    configuracoes JSONB DEFAULT '{
        "moeda": "BRL",
        "alertas": {
            "estoque_minimo": true,
            "produto_vencendo": true,
            "ruptura_estoque": true
        },
        "categorias_padrao": [],
        "campos_personalizados": []
    }'::jsonb,
    plano TEXT DEFAULT 'gratuito',
    limites JSONB DEFAULT '{
        "produtos": 100,
        "movimentacoes_mes": 1000,
        "usuarios": 3
    }'::jsonb,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários da empresa (funcionários)
CREATE TABLE IF NOT EXISTS public.usuarios_empresa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'funcionario' CHECK (role IN ('proprietario', 'gerente', 'funcionario', 'visualizador')),
    permissoes JSONB DEFAULT '{
        "produtos": {"criar": true, "editar": true, "excluir": false, "visualizar": true},
        "estoque": {"entrada": true, "saida": true, "ajuste": false, "visualizar": true},
        "relatorios": {"visualizar": true, "exportar": false}
    }'::jsonb,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, usuario_id)
);

-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS public.categorias_produto (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    cor TEXT DEFAULT '#6B7280',
    icone TEXT DEFAULT '📦',
    categoria_pai_id UUID REFERENCES public.categorias_produto(id),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, nome)
);

-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    cnpj_cpf TEXT,
    contato JSONB DEFAULT '{
        "telefone": "",
        "email": "",
        "endereco": "",
        "pessoa_contato": ""
    }'::jsonb,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela principal de produtos
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    codigo_interno TEXT NOT NULL, -- Código único interno
    codigo_barras TEXT, -- Código de barras (pode ser NULL)
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria_id UUID REFERENCES public.categorias_produto(id),
    fornecedor_id UUID REFERENCES public.fornecedores(id),
    
    -- Informações de preço e custo
    preco_custo DECIMAL(10,2) DEFAULT 0,
    preco_venda DECIMAL(10,2) DEFAULT 0,
    margem_lucro DECIMAL(5,2) DEFAULT 0, -- Percentual
    
    -- Controle de estoque
    estoque_atual INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 0,
    estoque_maximo INTEGER DEFAULT 0,
    unidade_medida TEXT DEFAULT 'UN', -- UN, KG, L, M, etc.
    
    -- Localização física
    localizacao JSONB DEFAULT '{
        "setor": "",
        "prateleira": "",
        "posicao": ""
    }'::jsonb,
    
    -- Informações adicionais
    peso DECIMAL(8,3),
    dimensoes JSONB DEFAULT '{
        "altura": null,
        "largura": null,
        "profundidade": null
    }'::jsonb,
    
    -- Datas importantes
    data_validade DATE,
    data_ultima_entrada TIMESTAMP WITH TIME ZONE,
    data_ultima_saida TIMESTAMP WITH TIME ZONE,
    
    -- Campos personalizados por tipo de negócio
    campos_extras JSONB DEFAULT '{}'::jsonb,
    
    -- Imagens (URLs do Supabase Storage)
    imagens TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Status e observações
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    
    -- Auditoria
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_por UUID REFERENCES auth.users(id),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(empresa_id, codigo_interno),
    UNIQUE(empresa_id, codigo_barras) -- Permite NULL mas não duplicados
);

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
    
    -- Tipo de movimentação
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'transferencia', 'inventario')),
    subtipo TEXT, -- 'compra', 'venda', 'devolucao', 'perda', 'quebra', etc.
    
    -- Quantidade e valores
    quantidade INTEGER NOT NULL,
    quantidade_anterior INTEGER NOT NULL,
    quantidade_posterior INTEGER NOT NULL,
    valor_unitario DECIMAL(10,2),
    valor_total DECIMAL(10,2),
    
    -- Referências externas
    documento_numero TEXT, -- NF, pedido, etc.
    documento_tipo TEXT, -- 'nota_fiscal', 'pedido_venda', etc.
    fornecedor_cliente TEXT,
    
    -- Observações e motivos
    motivo TEXT NOT NULL,
    observacoes TEXT,
    
    -- Usuário responsável
    usuario_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- Data da movimentação
    data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de inventários (contagens físicas)
CREATE TABLE IF NOT EXISTS public.inventarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'finalizado', 'cancelado')),
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    responsavel_id UUID REFERENCES auth.users(id) NOT NULL,
    categoria_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Filtrar por categorias
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens do inventário
CREATE TABLE IF NOT EXISTS public.inventario_itens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventario_id UUID REFERENCES public.inventarios(id) ON DELETE CASCADE NOT NULL,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
    quantidade_sistema INTEGER NOT NULL, -- Quantidade no sistema
    quantidade_contada INTEGER, -- Quantidade contada fisicamente
    diferenca INTEGER GENERATED ALWAYS AS (quantidade_contada - quantidade_sistema) STORED,
    observacoes TEXT,
    contado_por UUID REFERENCES auth.users(id),
    data_contagem TIMESTAMP WITH TIME ZONE,
    UNIQUE(inventario_id, produto_id)
);

-- ====================
-- ÍNDICES PARA PERFORMANCE
-- ====================

CREATE INDEX IF NOT EXISTS idx_empresas_proprietario ON public.empresas(usuario_proprietario_id);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON public.produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras ON public.produtos(codigo_barras) WHERE codigo_barras IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_interno ON public.produtos(empresa_id, codigo_interno);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque_minimo ON public.produtos(empresa_id, estoque_minimo) WHERE estoque_atual <= estoque_minimo;
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON public.movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON public.movimentacoes_estoque(empresa_id, data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON public.movimentacoes_estoque(empresa_id, tipo);

-- ====================
-- TRIGGERS E FUNÇÕES
-- ====================

-- Função para atualizar estoque após movimentação
CREATE OR REPLACE FUNCTION atualizar_estoque_produto()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o estoque atual do produto
    UPDATE public.produtos 
    SET 
        estoque_atual = NEW.quantidade_posterior,
        data_ultima_entrada = CASE WHEN NEW.tipo = 'entrada' THEN NEW.data_movimentacao ELSE data_ultima_entrada END,
        data_ultima_saida = CASE WHEN NEW.tipo = 'saida' THEN NEW.data_movimentacao ELSE data_ultima_saida END,
        atualizado_em = NOW()
    WHERE id = NEW.produto_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estoque
CREATE OR REPLACE TRIGGER trigger_atualizar_estoque
    AFTER INSERT ON public.movimentacoes_estoque
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_estoque_produto();

-- Função para validar movimentação de estoque
CREATE OR REPLACE FUNCTION validar_movimentacao_estoque()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se há estoque suficiente para saída
    IF NEW.tipo = 'saida' AND NEW.quantidade > NEW.quantidade_anterior THEN
        RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', NEW.quantidade_anterior, NEW.quantidade;
    END IF;
    
    -- Calcular quantidade posterior
    CASE NEW.tipo
        WHEN 'entrada' THEN
            NEW.quantidade_posterior = NEW.quantidade_anterior + NEW.quantidade;
        WHEN 'saida' THEN
            NEW.quantidade_posterior = NEW.quantidade_anterior - NEW.quantidade;
        WHEN 'ajuste' THEN
            NEW.quantidade_posterior = NEW.quantidade;
        ELSE
            NEW.quantidade_posterior = NEW.quantidade_anterior;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar movimentação
CREATE OR REPLACE TRIGGER trigger_validar_movimentacao
    BEFORE INSERT ON public.movimentacoes_estoque
    FOR EACH ROW
    EXECUTE FUNCTION validar_movimentacao_estoque();

-- ====================
-- ROW LEVEL SECURITY (RLS)
-- ====================

-- Ativar RLS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_itens ENABLE ROW LEVEL SECURITY;

-- Políticas para empresas
CREATE POLICY "Proprietários veem suas empresas" ON public.empresas
    FOR ALL USING (usuario_proprietario_id = auth.uid());

-- Políticas para produtos (usuários veem apenas produtos de suas empresas)
CREATE POLICY "Usuários veem produtos de suas empresas" ON public.produtos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresa ue 
            WHERE ue.empresa_id = produtos.empresa_id 
            AND ue.usuario_id = auth.uid() 
            AND ue.ativo = true
        )
    );

CREATE POLICY "Usuários podem criar produtos em suas empresas" ON public.produtos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresa ue 
            WHERE ue.empresa_id = produtos.empresa_id 
            AND ue.usuario_id = auth.uid() 
            AND ue.ativo = true
            AND (ue.permissoes->'produtos'->>'criar')::boolean = true
        )
    );

CREATE POLICY "Usuários podem atualizar produtos de suas empresas" ON public.produtos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresa ue 
            WHERE ue.empresa_id = produtos.empresa_id 
            AND ue.usuario_id = auth.uid() 
            AND ue.ativo = true
            AND (ue.permissoes->'produtos'->>'editar')::boolean = true
        )
    );

-- Políticas similares para outras tabelas
CREATE POLICY "Usuários veem movimentações de suas empresas" ON public.movimentacoes_estoque
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios_empresa ue 
            WHERE ue.empresa_id = movimentacoes_estoque.empresa_id 
            AND ue.usuario_id = auth.uid() 
            AND ue.ativo = true
        )
    );

-- ====================
-- VIEWS ÚTEIS
-- ====================

-- View de produtos com informações consolidadas
CREATE OR REPLACE VIEW public.view_produtos_completos AS
SELECT 
    p.*,
    c.nome as categoria_nome,
    c.cor as categoria_cor,
    f.nome as fornecedor_nome,
    (p.estoque_atual <= p.estoque_minimo) as estoque_baixo,
    (p.data_validade IS NOT NULL AND p.data_validade <= CURRENT_DATE + INTERVAL '30 days') as produto_vencendo,
    COALESCE(
        (SELECT SUM(quantidade) FROM public.movimentacoes_estoque 
         WHERE produto_id = p.id AND tipo = 'entrada' AND data_movimentacao >= CURRENT_DATE - INTERVAL '30 days'),
        0
    ) as entradas_mes,
    COALESCE(
        (SELECT SUM(quantidade) FROM public.movimentacoes_estoque 
         WHERE produto_id = p.id AND tipo = 'saida' AND data_movimentacao >= CURRENT_DATE - INTERVAL '30 days'),
        0
    ) as saidas_mes
FROM public.produtos p
LEFT JOIN public.categorias_produto c ON p.categoria_id = c.id
LEFT JOIN public.fornecedores f ON p.fornecedor_id = f.id;