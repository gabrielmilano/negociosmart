import type { Database } from '@/lib/supabase'

// Tipos base do Supabase
export type StatusPedido = 'PENDENTE' | 'ENVIADO_N8N' | 'RESOLVIDO'

export type ProdutoComPedido = Database['public']['Tables']['produtos']['Row']

export interface HistoricoStatusPedido {
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

export interface AlteracaoStatusPedido {
  produto_id: string
  status: StatusPedido
  data: string
  observacoes?: string
  usuario_id: string
  empresa_id: string
}

export interface PedidoService {
  listarProdutosCriticos(): Promise<ProdutoComPedido[]>
  atualizarStatusPedido(alteracao: AlteracaoStatusPedido): Promise<void>
  buscarHistorico(produtoId: string): Promise<HistoricoStatusPedido[]>
}