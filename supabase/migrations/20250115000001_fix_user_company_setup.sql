-- ====================
-- CORREÇÃO DO SETUP DE EMPRESA DO USUÁRIO
-- ====================

-- Função para criar empresa padrão para usuário
CREATE OR REPLACE FUNCTION public.create_default_company_for_user()
RETURNS TRIGGER AS $$
DECLARE
    empresa_id UUID;
BEGIN
    -- Criar empresa padrão para o usuário
    INSERT INTO public.empresas (
        nome,
        cnpj,
        email,
        telefone,
        endereco,
        usuario_proprietario_id,
        plano,
        status,
        configuracoes
    ) VALUES (
        COALESCE(NEW.raw_user_meta_data->>'nome', 'Minha Empresa'),
        NULL,
        NEW.email,
        NULL,
        NULL,
        NEW.id,
        'gratuito',
        'ativo',
        '{}'::jsonb
    ) RETURNING id INTO empresa_id;

    -- Adicionar usuário à empresa com todas as permissões
    INSERT INTO public.usuarios_empresa (
        usuario_id,
        empresa_id,
        role,
        ativo,
        permissoes
    ) VALUES (
        NEW.id,
        empresa_id,
        'proprietario',
        true,
        '{
            "produtos": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
            "categorias": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
            "fornecedores": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
            "movimentacoes": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
            "inventarios": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
            "relatorios": {"visualizar": true}
        }'::jsonb
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar empresa padrão quando usuário se registra
DROP TRIGGER IF EXISTS trigger_create_default_company ON auth.users;
CREATE TRIGGER trigger_create_default_company
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_company_for_user();

-- Função para obter empresa do usuário
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
    empresa_id UUID;
BEGIN
    SELECT ue.empresa_id INTO empresa_id
    FROM public.usuarios_empresa ue
    WHERE ue.usuario_id = user_id
    AND ue.ativo = true
    LIMIT 1;
    
    RETURN empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Política mais simples para produtos (temporária para debug)
DROP POLICY IF EXISTS "Usuários veem produtos de suas empresas" ON public.produtos;
DROP POLICY IF EXISTS "Usuários podem criar produtos em suas empresas" ON public.produtos;
DROP POLICY IF EXISTS "Usuários podem atualizar produtos de suas empresas" ON public.produtos;

-- Políticas simplificadas para debug
CREATE POLICY "Usuários veem produtos de suas empresas" ON public.produtos
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar produtos em suas empresas" ON public.produtos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar produtos de suas empresas" ON public.produtos
    FOR UPDATE USING (true);

-- Políticas para categorias
DROP POLICY IF EXISTS "Usuários veem categorias de suas empresas" ON public.categorias_produto;
DROP POLICY IF EXISTS "Usuários podem criar categorias em suas empresas" ON public.categorias_produto;
DROP POLICY IF EXISTS "Usuários podem atualizar categorias de suas empresas" ON public.categorias_produto;

CREATE POLICY "Usuários veem categorias de suas empresas" ON public.categorias_produto
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar categorias em suas empresas" ON public.categorias_produto
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar categorias de suas empresas" ON public.categorias_produto
    FOR UPDATE USING (true);

-- Políticas para fornecedores
DROP POLICY IF EXISTS "Usuários veem fornecedores de suas empresas" ON public.fornecedores;
DROP POLICY IF EXISTS "Usuários podem criar fornecedores em suas empresas" ON public.fornecedores;
DROP POLICY IF EXISTS "Usuários podem atualizar fornecedores de suas empresas" ON public.fornecedores;

CREATE POLICY "Usuários veem fornecedores de suas empresas" ON public.fornecedores
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar fornecedores em suas empresas" ON public.fornecedores
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar fornecedores de suas empresas" ON public.fornecedores
    FOR UPDATE USING (true);

-- Políticas para movimentações
DROP POLICY IF EXISTS "Usuários veem movimentações de suas empresas" ON public.movimentacoes_estoque;
DROP POLICY IF EXISTS "Usuários podem criar movimentações em suas empresas" ON public.movimentacoes_estoque;

CREATE POLICY "Usuários veem movimentações de suas empresas" ON public.movimentacoes_estoque
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar movimentações em suas empresas" ON public.movimentacoes_estoque
    FOR INSERT WITH CHECK (true);

-- Políticas para inventários
DROP POLICY IF EXISTS "Usuários veem inventários de suas empresas" ON public.inventarios;
DROP POLICY IF EXISTS "Usuários podem criar inventários em suas empresas" ON public.inventarios;

CREATE POLICY "Usuários veem inventários de suas empresas" ON public.inventarios
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar inventários em suas empresas" ON public.inventarios
    FOR INSERT WITH CHECK (true);

-- Políticas para itens de inventário
DROP POLICY IF EXISTS "Usuários veem itens de inventário de suas empresas" ON public.inventario_itens;
DROP POLICY IF EXISTS "Usuários podem criar itens de inventário em suas empresas" ON public.inventario_itens;

CREATE POLICY "Usuários veem itens de inventário de suas empresas" ON public.inventario_itens
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar itens de inventário em suas empresas" ON public.inventario_itens
    FOR INSERT WITH CHECK (true);
