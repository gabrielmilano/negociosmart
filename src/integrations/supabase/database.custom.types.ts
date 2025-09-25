export interface Database {
  public: {
    Tables: {
      produtos: {
        Row: {
          id: string
          empresa_id: string
          codigo_interno: string
          codigo_barras?: string
          nome: string
          descricao?: string
          categoria_id?: string
          fornecedor_id?: string
          preco_custo?: number
          preco_venda?: number
          estoque_atual: number
          estoque_minimo: number
          estoque_maximo?: number
          unidade_medida?: string
          localizacao?: Record<string, any>
          campos_extras?: Record<string, any>
          imagens?: string[]
          observacoes?: string
          ativo: boolean
          criado_em?: string
          criado_por?: string
          atualizado_em?: string
          atualizado_por?: string
          status_pedido?: string
          ultima_atualizacao_pedido?: string
          observacoes_pedido?: string
          usuario_ultima_atualizacao?: string
        }
        Insert: {
          id?: string
          empresa_id?: string
          codigo_interno?: string
          codigo_barras?: string
          nome?: string
          descricao?: string
          categoria_id?: string
          fornecedor_id?: string
          preco_custo?: number
          preco_venda?: number
          estoque_atual?: number
          estoque_minimo?: number
          estoque_maximo?: number
          unidade_medida?: string
          localizacao?: Record<string, any>
          campos_extras?: Record<string, any>
          imagens?: string[]
          observacoes?: string
          ativo?: boolean
          criado_em?: string
          criado_por?: string
          atualizado_em?: string
          atualizado_por?: string
          status_pedido?: string
          ultima_atualizacao_pedido?: string
          observacoes_pedido?: string
          usuario_ultima_atualizacao?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          codigo_interno?: string
          codigo_barras?: string
          nome?: string
          descricao?: string
          categoria_id?: string
          fornecedor_id?: string
          preco_custo?: number
          preco_venda?: number
          estoque_atual?: number
          estoque_minimo?: number
          estoque_maximo?: number
          unidade_medida?: string
          localizacao?: Record<string, any>
          campos_extras?: Record<string, any>
          imagens?: string[]
          observacoes?: string
          ativo?: boolean
          criado_em?: string
          criado_por?: string
          atualizado_em?: string
          atualizado_por?: string
          status_pedido?: string
          ultima_atualizacao_pedido?: string
          observacoes_pedido?: string
          usuario_ultima_atualizacao?: string
        }
      }
      historico_status_pedido: {
        Row: {
          id: string
          produto_id: string
          status: string
          data: string
          observacoes?: string
          usuario_id: string
          empresa_id: string
          criado_em: string
          usuario?: { email: string }
        }
        Insert: {
          id?: string
          produto_id: string
          status: string
          data?: string
          observacoes?: string
          usuario_id: string
          empresa_id: string
          criado_em?: string
        }
        Update: {
          id?: string
          produto_id?: string
          status?: string
          data?: string
          observacoes?: string
          usuario_id?: string
          empresa_id?: string
          criado_em?: string
        }
      }
      historico_status_pedido: {
        Row: {
          id: string
          produto_id: string
          status: string
          data: string
          observacoes?: string
          usuario_id: string
          empresa_id: string
          criado_em: string
          usuario?: { email: string }
        }
        Insert: {
          id?: string
          produto_id: string
          status: string
          data?: string
          observacoes?: string
          usuario_id: string
          empresa_id: string
          criado_em?: string
        }
        Update: {
          id?: string
          produto_id?: string
          status?: string
          data?: string
          observacoes?: string
          usuario_id?: string
          empresa_id?: string
          criado_em?: string
        }
      }
    }
    Views: {
      view_produtos_pedidos: {
        Row: {
          id: string
          empresa_id: string
          codigo_interno: string
          codigo_barras?: string
          nome: string
          descricao?: string
          categoria_id?: string
          fornecedor_id?: string
          preco_custo?: number
          preco_venda?: number
          estoque_atual: number
          estoque_minimo: number
          estoque_maximo?: number
          unidade_medida?: string
          localizacao?: Record<string, any>
          campos_extras?: Record<string, any>
          imagens?: string[]
          observacoes?: string
          ativo: boolean
          criado_em?: string
          criado_por?: string
          atualizado_em?: string
          atualizado_por?: string
          status_pedido?: string
          ultima_atualizacao_pedido?: string
          observacoes_pedido?: string
          usuario_ultima_atualizacao?: string
        }
        Insert: never
        Update: never
      }
    }
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}