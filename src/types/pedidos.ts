import type { Database } from '@/integrations/supabase/database.types'

export type StatusPedido = Database['public']['Tables']['historico_status_pedido']['Row']['status']

export type ProdutoBase = Database['public']['Views']['view_produtos_pedidos']['Row']

export interface ProdutoComStatus extends Omit<ProdutoBase, 'status_pedido'> {
  status_pedido: StatusPedido
  ultima_atualizacao_pedido?: string
  observacoes_pedido?: string
  usuario_ultima_atualizacao?: string
}

export interface AlteracaoStatus {
  produto_id: string
  status: StatusPedido
  data: string
  observacoes?: string
  usuario_id: string
  empresa_id: string
}

export interface HistoricoStatus {
  id: string
  produto_id: string
  status: StatusPedido
  data: string
  observacoes?: string
  usuario_id: string
  empresa_id: string
  criado_em: string
  usuario?: { email: string }
}

export interface PedidosService {
  listarProdutosCriticos(): Promise<ProdutoComStatus[]>
  atualizarStatusPedido(alteracao: AlteracaoStatus): Promise<void>
  integrarComN8N(produtos: ProdutoComStatus[]): Promise<void>
  buscarHistorico(produtoId: string): Promise<HistoricoStatus[]>
}