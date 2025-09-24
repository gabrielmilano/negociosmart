-- Fix the company creation trigger
DROP TRIGGER IF EXISTS trigger_create_default_company ON auth.users;

-- Update company creation function
CREATE OR REPLACE FUNCTION public.create_default_company_for_user()
RETURNS TRIGGER AS $$
DECLARE
    empresa_id UUID;
BEGIN
    -- Criar empresa padrão para o usuário
    INSERT INTO public.empresas (
        nome,
        tipo_negocio,
        usuario_proprietario_id,
        plano,
        limites
    ) VALUES (
        COALESCE(NEW.raw_user_meta_data->>'nome', 'Minha Empresa'),
        'geral',
        NEW.id,
        'gratuito',
        '{
            "produtos": 100,
            "movimentacoes_mes": 1000,
            "usuarios": 3
        }'::jsonb
    ) RETURNING id INTO empresa_id;

    -- Adicionar usuário à empresa com todas as permissões
    INSERT INTO public.usuarios_empresa (
        usuario_id,
        empresa_id,
        role,
        permissoes
    ) VALUES (
        NEW.id,
        empresa_id,
        'proprietario',
        '{
            "produtos": {"criar": true, "editar": true, "excluir": true, "visualizar": true},
            "estoque": {"entrada": true, "saida": true, "ajuste": true, "visualizar": true},
            "relatorios": {"visualizar": true, "exportar": true}
        }'::jsonb
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create trigger with BEFORE INSERT to avoid race conditions
CREATE TRIGGER trigger_create_default_company
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_company_for_user();

-- Update policies to be more strict
-- Produtos
DROP POLICY IF EXISTS "Usuários veem produtos de suas empresas" ON public.produtos;
DROP POLICY IF EXISTS "Usuários podem criar produtos em suas empresas" ON public.produtos;
DROP POLICY IF EXISTS "Usuários podem atualizar produtos de suas empresas" ON public.produtos;
DROP POLICY IF EXISTS "Usuários podem excluir produtos de suas empresas" ON public.produtos;

CREATE POLICY "Usuários veem produtos de suas empresas" ON public.produtos
    FOR SELECT USING (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar produtos em suas empresas" ON public.produtos
    FOR INSERT WITH CHECK (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'produtos'->>'criar' = 'true'
        )
    );

CREATE POLICY "Usuários podem atualizar produtos de suas empresas" ON public.produtos
    FOR UPDATE USING (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'produtos'->>'editar' = 'true'
        )
    );

CREATE POLICY "Usuários podem excluir produtos de suas empresas" ON public.produtos
    FOR DELETE USING (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'produtos'->>'excluir' = 'true'
        )
    );

-- Categorias
DROP POLICY IF EXISTS "Usuários veem categorias de suas empresas" ON public.categorias_produto;
DROP POLICY IF EXISTS "Usuários podem criar categorias em suas empresas" ON public.categorias_produto;
DROP POLICY IF EXISTS "Usuários podem atualizar categorias de suas empresas" ON public.categorias_produto;
DROP POLICY IF EXISTS "Usuários podem excluir categorias de suas empresas" ON public.categorias_produto;

CREATE POLICY "Usuários veem categorias de suas empresas" ON public.categorias_produto
    FOR SELECT USING (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar categorias em suas empresas" ON public.categorias_produto
    FOR INSERT WITH CHECK (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'produtos'->>'criar' = 'true'
        )
    );

CREATE POLICY "Usuários podem atualizar categorias de suas empresas" ON public.categorias_produto
    FOR UPDATE USING (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'produtos'->>'editar' = 'true'
        )
    );

CREATE POLICY "Usuários podem excluir categorias de suas empresas" ON public.categorias_produto
    FOR DELETE USING (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'produtos'->>'excluir' = 'true'
        )
    );

-- Inventários
DROP POLICY IF EXISTS "Usuários veem inventários de suas empresas" ON public.inventarios;
DROP POLICY IF EXISTS "Usuários podem criar inventários em suas empresas" ON public.inventarios;
DROP POLICY IF EXISTS "Usuários podem atualizar inventários de suas empresas" ON public.inventarios;
DROP POLICY IF EXISTS "Usuários podem excluir inventários de suas empresas" ON public.inventarios;

CREATE POLICY "Usuários veem inventários de suas empresas" ON public.inventarios
    FOR SELECT USING (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'estoque'->>'visualizar' = 'true'
        )
    );

CREATE POLICY "Usuários podem criar inventários em suas empresas" ON public.inventarios
    FOR INSERT WITH CHECK (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'estoque'->>'ajuste' = 'true'
        )
    );

CREATE POLICY "Usuários podem atualizar inventários de suas empresas" ON public.inventarios
    FOR UPDATE USING (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'estoque'->>'ajuste' = 'true'
        )
    );

CREATE POLICY "Usuários podem excluir inventários de suas empresas" ON public.inventarios
    FOR DELETE USING (
        empresa_id IN (
            SELECT ue.empresa_id
            FROM public.usuarios_empresa ue
            WHERE ue.usuario_id = auth.uid()
            AND ue.permissoes->'estoque'->>'ajuste' = 'true'
        )
    );

-- Itens de Inventário
DROP POLICY IF EXISTS "Usuários veem itens de inventário de suas empresas" ON public.inventario_itens;
DROP POLICY IF EXISTS "Usuários podem criar itens de inventário em suas empresas" ON public.inventario_itens;
DROP POLICY IF EXISTS "Usuários podem atualizar itens de inventário em suas empresas" ON public.inventario_itens;
DROP POLICY IF EXISTS "Usuários podem excluir itens de inventário em suas empresas" ON public.inventario_itens;

CREATE POLICY "Usuários veem itens de inventário de suas empresas" ON public.inventario_itens
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.inventarios i
            JOIN public.usuarios_empresa ue ON i.empresa_id = ue.empresa_id
            WHERE i.id = inventario_id
            AND ue.usuario_id = auth.uid()
            AND ue.permissoes->'estoque'->>'visualizar' = 'true'
        )
    );

CREATE POLICY "Usuários podem criar itens de inventário em suas empresas" ON public.inventario_itens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.inventarios i
            JOIN public.usuarios_empresa ue ON i.empresa_id = ue.empresa_id
            WHERE i.id = inventario_id
            AND ue.usuario_id = auth.uid()
            AND ue.permissoes->'estoque'->>'ajuste' = 'true'
        )
    );

CREATE POLICY "Usuários podem atualizar itens de inventário em suas empresas" ON public.inventario_itens
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.inventarios i
            JOIN public.usuarios_empresa ue ON i.empresa_id = ue.empresa_id
            WHERE i.id = inventario_id
            AND ue.usuario_id = auth.uid()
            AND ue.permissoes->'estoque'->>'ajuste' = 'true'
        )
    );

CREATE POLICY "Usuários podem excluir itens de inventário em suas empresas" ON public.inventario_itens
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM public.inventarios i
            JOIN public.usuarios_empresa ue ON i.empresa_id = ue.empresa_id
            WHERE i.id = inventario_id
            AND ue.usuario_id = auth.uid()
            AND ue.permissoes->'estoque'->>'ajuste' = 'true'
        )
    );