-- Corrigir problemas de segurança detectados

-- Adicionar políticas RLS faltantes para categorias_produto
CREATE POLICY "Usuários veem categorias de suas empresas" ON public.categorias_produto
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_empresa ue 
      WHERE ue.empresa_id = categorias_produto.empresa_id 
      AND ue.usuario_id = auth.uid() 
      AND ue.ativo = true
    )
  );

CREATE POLICY "Usuários podem criar categorias em suas empresas" ON public.categorias_produto
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios_empresa ue 
      WHERE ue.empresa_id = categorias_produto.empresa_id 
      AND ue.usuario_id = auth.uid() 
      AND ue.ativo = true
    )
  );

-- Adicionar políticas RLS faltantes para fornecedores
CREATE POLICY "Usuários veem fornecedores de suas empresas" ON public.fornecedores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_empresa ue 
      WHERE ue.empresa_id = fornecedores.empresa_id 
      AND ue.usuario_id = auth.uid() 
      AND ue.ativo = true
    )
  );

CREATE POLICY "Usuários podem criar fornecedores em suas empresas" ON public.fornecedores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios_empresa ue 
      WHERE ue.empresa_id = fornecedores.empresa_id 
      AND ue.usuario_id = auth.uid() 
      AND ue.ativo = true
    )
  );

-- Adicionar políticas RLS faltantes para usuarios_empresa
CREATE POLICY "Usuários veem sua própria relação com empresas" ON public.usuarios_empresa
  FOR SELECT USING (usuario_id = auth.uid());

-- Corrigir funções para ter search_path seguro
CREATE OR REPLACE FUNCTION public.atualizar_estoque_produto()
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.validar_movimentacao_estoque()
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.usuarios (id, email, nome)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$function$;