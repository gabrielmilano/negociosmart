import { Database as BaseDatabase } from './types'

export interface Database extends Omit<BaseDatabase, 'public'> {
  public: {
    Tables: {
      ...BaseDatabase['public']['Tables'],

      // Adicionar novas propriedades à tabela produtos
      produtos: {
        Row: BaseDatabase['public']['Tables']['produtos']['Row'] & {
          status_pedido?: 'PENDENTE' | 'ENVIADO_N8N' | 'RESOLVIDO'
          ultima_atualizacao_pedido?: string
          observacoes_pedido?: string
          usuario_ultima_atualizacao?: string
        }
        Insert: BaseDatabase['public']['Tables']['produtos']['Insert'] & {
          status_pedido?: 'PENDENTE' | 'ENVIADO_N8N' | 'RESOLVIDO'
          ultima_atualizacao_pedido?: string
          observacoes_pedido?: string
          usuario_ultima_atualizacao?: string
        }
        Update: BaseDatabase['public']['Tables']['produtos']['Update'] & {
          status_pedido?: 'PENDENTE' | 'ENVIADO_N8N' | 'RESOLVIDO'
          ultima_atualizacao_pedido?: string
          observacoes_pedido?: string
          usuario_ultima_atualizacao?: string
        }
      }
      historico_status_pedido: {
        Row: {
          id: string
          produto_id: string
          status: 'PENDENTE' | 'ENVIADO_N8N' | 'RESOLVIDO'
          data: string
          observacoes?: string
          usuario_id: string
          empresa_id: string
          criado_em: string
        }
        Insert: {
          id?: string
          produto_id: string
          status: 'PENDENTE' | 'ENVIADO_N8N' | 'RESOLVIDO'
          data?: string
          observacoes?: string
          usuario_id: string
          empresa_id: string
          criado_em?: string
        }
        Update: {
          id?: string
          produto_id?: string
          status?: 'PENDENTE' | 'ENVIADO_N8N' | 'RESOLVIDO'
          data?: string
          observacoes?: string
          usuario_id?: string
          empresa_id?: string
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_status_pedido_empresa_id_fkey"
            columns: ["empresa_id"]
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_status_pedido_produto_id_fkey"
            columns: ["produto_id"]
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_status_pedido_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: BaseDatabase['public']['Views']
    Functions: BaseDatabase['public']['Functions']
    Enums: BaseDatabase['public']['Enums']
    CompositeTypes: BaseDatabase['public']['CompositeTypes']
  }
}