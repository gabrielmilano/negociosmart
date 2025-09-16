-- ====================
-- CORREÇÃO DOS TRIGGERS DE ESTOQUE
-- ====================

-- Corrigir função de validação de movimentação
CREATE OR REPLACE FUNCTION public.validar_movimentacao_estoque()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se há estoque suficiente para saída
    IF NEW.tipo = 'saida' AND NEW.quantidade > NEW.quantidade_anterior THEN
        RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', NEW.quantidade_anterior, NEW.quantidade;
    END IF;
    
    -- Validar quantidade negativa
    IF NEW.quantidade < 0 THEN
        RAISE EXCEPTION 'Quantidade não pode ser negativa: %', NEW.quantidade;
    END IF;
    
    -- Validar quantidade posterior negativa para saídas
    IF NEW.tipo = 'saida' AND NEW.quantidade_posterior < 0 THEN
        RAISE EXCEPTION 'Estoque não pode ficar negativo. Resultado seria: %', NEW.quantidade_posterior;
    END IF;
    
    -- Calcular quantidade posterior automaticamente
    CASE NEW.tipo
        WHEN 'entrada' THEN
            NEW.quantidade_posterior = NEW.quantidade_anterior + NEW.quantidade;
        WHEN 'saida' THEN
            NEW.quantidade_posterior = NEW.quantidade_anterior - NEW.quantidade;
        WHEN 'ajuste' THEN
            NEW.quantidade_posterior = NEW.quantidade;
        ELSE
            RAISE EXCEPTION 'Tipo de movimentação inválido: %', NEW.tipo;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Corrigir função de atualização de estoque
CREATE OR REPLACE FUNCTION public.atualizar_estoque_produto()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o estoque atual do produto
    UPDATE public.produtos 
    SET 
        estoque_atual = NEW.quantidade_posterior,
        data_ultima_entrada = CASE 
            WHEN NEW.tipo = 'entrada' THEN COALESCE(NEW.data_movimentacao, NOW())
            ELSE data_ultima_entrada 
        END,
        data_ultima_saida = CASE 
            WHEN NEW.tipo = 'saida' THEN COALESCE(NEW.data_movimentacao, NOW())
            ELSE data_ultima_saida 
        END,
        atualizado_em = NOW(),
        atualizado_por = NEW.usuario_id
    WHERE id = NEW.produto_id;
    
    -- Verificar se a atualização afetou alguma linha
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Produto não encontrado: %', NEW.produto_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar triggers para garantir que estão corretos
DROP TRIGGER IF EXISTS trigger_validar_movimentacao ON public.movimentacoes_estoque;
DROP TRIGGER IF EXISTS trigger_atualizar_estoque ON public.movimentacoes_estoque;

-- Recriar trigger de validação
CREATE TRIGGER trigger_validar_movimentacao
    BEFORE INSERT ON public.movimentacoes_estoque
    FOR EACH ROW
    EXECUTE FUNCTION public.validar_movimentacao_estoque();

-- Recriar trigger de atualização
CREATE TRIGGER trigger_atualizar_estoque
    AFTER INSERT ON public.movimentacoes_estoque
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_estoque_produto();

-- Adicionar constraint para garantir que quantidade_posterior seja calculada corretamente
ALTER TABLE public.movimentacoes_estoque 
ADD CONSTRAINT check_quantidade_posterior_correta 
CHECK (
    (tipo = 'entrada' AND quantidade_posterior = quantidade_anterior + quantidade) OR
    (tipo = 'saida' AND quantidade_posterior = quantidade_anterior - quantidade) OR
    (tipo = 'ajuste' AND quantidade_posterior = quantidade) OR
    (tipo = 'transferencia' AND quantidade_posterior = quantidade_anterior) OR
    (tipo = 'inventario' AND quantidade_posterior = quantidade)
);

-- Adicionar constraint para evitar estoque negativo
ALTER TABLE public.movimentacoes_estoque 
ADD CONSTRAINT check_quantidade_posterior_nao_negativa 
CHECK (quantidade_posterior >= 0);

-- Adicionar constraint para quantidade não negativa
ALTER TABLE public.movimentacoes_estoque 
ADD CONSTRAINT check_quantidade_nao_negativa 
CHECK (quantidade >= 0);

-- Adicionar constraint para quantidade_anterior não negativa
ALTER TABLE public.movimentacoes_estoque 
ADD CONSTRAINT check_quantidade_anterior_nao_negativa 
CHECK (quantidade_anterior >= 0);
