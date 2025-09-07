export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      automacoes: {
        Row: {
          atualizado_em: string
          categoria: string | null
          configuracao: Json | null
          criado_em: string
          descricao: string | null
          id: string
          metricas: Json | null
          nome: string
          status: string
          token: string
          usuario_id: string
          webhook: string
        }
        Insert: {
          atualizado_em?: string
          categoria?: string | null
          configuracao?: Json | null
          criado_em?: string
          descricao?: string | null
          id?: string
          metricas?: Json | null
          nome: string
          status?: string
          token: string
          usuario_id: string
          webhook: string
        }
        Update: {
          atualizado_em?: string
          categoria?: string | null
          configuracao?: Json | null
          criado_em?: string
          descricao?: string | null
          id?: string
          metricas?: Json | null
          nome?: string
          status?: string
          token?: string
          usuario_id?: string
          webhook?: string
        }
        Relationships: []
      }
      logs_webhook: {
        Row: {
          id: string
          ip_address: string
          method: string
          request_data: Json | null
          response_data: Json | null
          response_time: number
          status_code: number
          timestamp: string
          usuario_id: string
          webhook_id: string
        }
        Insert: {
          id?: string
          ip_address: string
          method: string
          request_data?: Json | null
          response_data?: Json | null
          response_time: number
          status_code: number
          timestamp?: string
          usuario_id: string
          webhook_id: string
        }
        Update: {
          id?: string
          ip_address?: string
          method?: string
          request_data?: Json | null
          response_data?: Json | null
          response_time?: number
          status_code?: number
          timestamp?: string
          usuario_id?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_webhook_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          avatar_url: string | null
          criado_em: string
          email: string
          id: string
          limites: Json
          nome: string
          plano: string
          role: string
          ultimo_acesso: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          criado_em?: string
          email: string
          id?: string
          limites?: Json
          nome: string
          plano?: string
          role?: string
          ultimo_acesso?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          criado_em?: string
          email?: string
          id?: string
          limites?: Json
          nome?: string
          plano?: string
          role?: string
          ultimo_acesso?: string
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          configuracao: Json | null
          criado_em: string
          id: string
          metricas: Json | null
          nome: string
          status: string
          token: string
          url: string
          usuario_id: string
        }
        Insert: {
          configuracao?: Json | null
          criado_em?: string
          id?: string
          metricas?: Json | null
          nome: string
          status?: string
          token: string
          url: string
          usuario_id: string
        }
        Update: {
          configuracao?: Json | null
          criado_em?: string
          id?: string
          metricas?: Json | null
          nome?: string
          status?: string
          token?: string
          url?: string
          usuario_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
