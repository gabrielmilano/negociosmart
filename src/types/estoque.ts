export type StatusPedido = 'PENDENTE' | 'ENVIADO_N8N' | 'RESOLVIDO'

export interface ProdutoCritico {
  id: string
  codigo_interno: string
  nome: string
  categoria_id: string
  categoria_nome: string
  estoque_atual: number
  estoque_minimo: number
  status_pedido: StatusPedido
  ultima_atualizacao: string | null
}

export interface AlteracaoStatus {
  produto_id: string
  status: StatusPedido
  data: string
  observacoes?: string
  usuario_id: string
}