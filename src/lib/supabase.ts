import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient(
      'https://placeholder.supabase.co', 
      'placeholder-anon-key',
      {
        auth: {
          persistSession: false
        }
      }
    )

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string
          nome: string
          avatar_url: string | null
          plano: 'gratuito' | 'pro' | 'enterprise'
          role: 'admin' | 'editor' | 'viewer'
          limites: {
            automacoes: number
            webhooks: number
            execucoes_mes: number
          }
          criado_em: string
          ultimo_acesso: string
        }
        Insert: {
          id: string
          email: string
          nome: string
          avatar_url?: string | null
          plano?: 'gratuito' | 'pro' | 'enterprise'
          role?: 'admin' | 'editor' | 'viewer'
          limites?: {
            automacoes: number
            webhooks: number
            execucoes_mes: number
          }
        }
        Update: {
          nome?: string
          avatar_url?: string | null
          plano?: 'gratuito' | 'pro' | 'enterprise'
          role?: 'admin' | 'editor' | 'viewer'
          ultimo_acesso?: string
        }
      }
      automacoes: {
        Row: {
          id: string
          usuario_id: string
          nome: string
          categoria: string
          descricao: string
          status: 'ativa' | 'pausada' | 'erro'
          webhook: string
          token: string
          configuracao: any
          metricas: any
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id: string
          usuario_id: string
          nome: string
          categoria: string
          descricao: string
          status?: 'ativa' | 'pausada' | 'erro'
          webhook: string
          token: string
          configuracao?: any
          metricas?: any
        }
        Update: {
          nome?: string
          categoria?: string
          descricao?: string
          status?: 'ativa' | 'pausada' | 'erro'
          configuracao?: any
          metricas?: any
          atualizado_em?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          usuario_id: string
          nome: string
          url: string
          token: string
          status: 'ativo' | 'inativo' | 'erro'
          configuracao: any
          metricas: any
          criado_em: string
        }
        Insert: {
          id: string
          usuario_id: string
          nome: string
          url: string
          token: string
          status?: 'ativo' | 'inativo' | 'erro'
          configuracao?: any
          metricas?: any
        }
        Update: {
          nome?: string
          status?: 'ativo' | 'inativo' | 'erro'
          configuracao?: any
          metricas?: any
        }
      }
      logs_webhook: {
        Row: {
          id: string
          webhook_id: string
          usuario_id: string
          method: string
          status_code: number
          response_time: number
          request_data: any
          response_data: any
          ip_address: string
          timestamp: string
        }
        Insert: {
          id: string
          webhook_id: string
          usuario_id: string
          method: string
          status_code: number
          response_time: number
          request_data?: any
          response_data?: any
          ip_address: string
        }
      }
    }
  }
}