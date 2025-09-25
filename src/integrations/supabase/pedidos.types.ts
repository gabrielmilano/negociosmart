import { Database } from './database.custom.types'

// Derive types from Database type
export type Tables = Database['public']['Tables']
export type Views = Database['public']['Views']

// Main tables
export type ProdutoRow = Tables['produtos']['Row']
export type ProdutoInsert = Tables['produtos']['Insert']
export type ProdutoUpdate = Tables['produtos']['Update']

export type HistoricoStatusPedidoRow = Tables['historico_status_pedido']['Row']
export type HistoricoStatusPedidoInsert = Tables['historico_status_pedido']['Insert']
export type HistoricoStatusPedidoUpdate = Tables['historico_status_pedido']['Update']

// Views
export type ProdutoPedidoView = Views['view_produtos_pedidos']['Row']

// Status types
export type StatusPedido = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'

// Context types
export interface ProdutoPedidoContextData extends ProdutoPedidoView {
  status_pedido: StatusPedido
  ultima_atualizacao_pedido?: string
  observacoes_pedido?: string
  usuario_ultima_atualizacao?: string
}

export interface HistoricoStatusPedidoContextData extends HistoricoStatusPedidoRow {
  usuario?: {
    email: string
  }
}

export interface PedidosContextType {
  produtosCriticos: ProdutoPedidoContextData[]
  historicoStatusPedido: HistoricoStatusPedidoContextData[]
  atualizarStatusPedido: (produtoId: string, status: StatusPedido, observacoes?: string) => Promise<void>
  fetchProdutosCriticos: () => Promise<void>
  fetchHistoricoStatusPedido: (produtoId: string) => Promise<void>
}