-- Adicionar colunas na tabela produtos
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS status_pedido text CHECK (status_pedido IN ('PENDENTE', 'ENVIADO_N8N', 'RESOLVIDO')),
  ADD COLUMN IF NOT EXISTS ultima_atualizacao_pedido timestamptz,
  ADD COLUMN IF NOT EXISTS observacoes_pedido text,
  ADD COLUMN IF NOT EXISTS usuario_ultima_atualizacao text;

-- Criar tabela de histórico de status
CREATE TABLE IF NOT EXISTS public.historico_status_pedido (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  produto_id uuid NOT NULL REFERENCES public.produtos(id),
  status text NOT NULL CHECK (status IN ('PENDENTE', 'ENVIADO_N8N', 'RESOLVIDO')),
  data timestamptz NOT NULL DEFAULT now(),
  observacoes text,
  usuario_id uuid NOT NULL REFERENCES auth.users(id),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id),
  criado_em timestamptz DEFAULT now()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_historico_status_pedido_produto_id ON public.historico_status_pedido(produto_id);
CREATE INDEX IF NOT EXISTS idx_historico_status_pedido_empresa_id ON public.historico_status_pedido(empresa_id);
CREATE INDEX IF NOT EXISTS idx_historico_status_pedido_usuario_id ON public.historico_status_pedido(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_status_pedido_status ON public.historico_status_pedido(status);
CREATE INDEX IF NOT EXISTS idx_produtos_status_pedido ON public.produtos(status_pedido);

-- Habilitar RLS
ALTER TABLE public.historico_status_pedido ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver histórico de suas empresas"
  ON public.historico_status_pedido
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_empresa ue
      WHERE ue.usuario_id = auth.uid()
      AND ue.empresa_id = historico_status_pedido.empresa_id
      AND ue.ativo = true
    )
  );

CREATE POLICY "Usuários podem inserir histórico em suas empresas"
  ON public.historico_status_pedido
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios_empresa ue
      WHERE ue.usuario_id = auth.uid()
      AND ue.empresa_id = historico_status_pedido.empresa_id
      AND ue.ativo = true
    )
  );

-- Criar ou atualizar view para produtos com status de pedido
CREATE OR REPLACE VIEW public.view_produtos_pedidos AS
SELECT 
  p.*,
  COALESCE(p.status_pedido, 'PENDENTE') as status_pedido,
  h.data as ultima_atualizacao_pedido,
  h.observacoes as observacoes_pedido,
  u.email as usuario_ultima_atualizacao
FROM public.produtos p
LEFT JOIN LATERAL (
  SELECT 
    hsp.data,
    hsp.observacoes,
    hsp.usuario_id,
    u.email
  FROM public.historico_status_pedido hsp
  LEFT JOIN auth.users u ON hsp.usuario_id = u.id
  WHERE hsp.produto_id = p.id
  ORDER BY hsp.data DESC
  LIMIT 1
) h ON true
LEFT JOIN auth.users u ON h.usuario_id = u.id
WHERE p.ativo = true;