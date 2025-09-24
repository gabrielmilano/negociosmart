export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      estoque: {
        Row: {
          id: string
          nome: string
          quantidade_atual: number
          estoque_minimo: number
          preco_custo: number
          preco_venda: number
          categoria_id: string | null
          fornecedor_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          quantidade_atual: number
          estoque_minimo: number
          preco_custo: number
          preco_venda: number
          categoria_id?: string | null
          fornecedor_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          quantidade_atual?: number
          estoque_minimo?: number
          preco_custo?: number
          preco_venda?: number
          categoria_id?: string | null
          fornecedor_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      movimentacoes_estoque: {
        Row: {
          id: string
          produto_id: string
          quantidade: number
          tipo: 'entrada' | 'saida'
          data: string
          observacao: string | null
          created_at: string
        }
        Insert: {
          id?: string
          produto_id: string
          quantidade: number
          tipo: 'entrada' | 'saida'
          data: string
          observacao?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          produto_id?: string
          quantidade?: number
          tipo?: 'entrada' | 'saida'
          data?: string
          observacao?: string | null
          created_at?: string
        }
      }
      categorias_produto: {
        Row: {
          id: string
          nome: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          created_at?: string
        }
      }
      fornecedores: {
        Row: {
          id: string
          nome: string
          email: string | null
          telefone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          email?: string | null
          telefone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string | null
          telefone?: string | null
          created_at?: string
        }
      }
    }
  }
}