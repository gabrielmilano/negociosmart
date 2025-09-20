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
      ambientes_empresa: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          configuracoes: Json | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          configuracoes?: Json | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          configuracoes?: Json | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
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
      categorias_produto: {
        Row: {
          ativo: boolean | null
          categoria_pai_id: string | null
          cor: string | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string
          icone: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          categoria_pai_id?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id: string
          icone?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          categoria_pai_id?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string
          icone?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_produto_categoria_pai_id_fkey"
            columns: ["categoria_pai_id"]
            isOneToOne: false
            referencedRelation: "categorias_produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_produto_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cnpj_cpf: string | null
          configuracoes: Json | null
          criado_em: string | null
          endereco: Json | null
          id: string
          limites: Json | null
          nome: string
          plano: string | null
          tipo_empresa: string | null
          tipo_negocio: string
          usuario_proprietario_id: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cnpj_cpf?: string | null
          configuracoes?: Json | null
          criado_em?: string | null
          endereco?: Json | null
          id?: string
          limites?: Json | null
          nome: string
          plano?: string | null
          tipo_empresa?: string | null
          tipo_negocio: string
          usuario_proprietario_id: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cnpj_cpf?: string | null
          configuracoes?: Json | null
          criado_em?: string | null
          endereco?: Json | null
          id?: string
          limites?: Json | null
          nome?: string
          plano?: string | null
          tipo_empresa?: string | null
          tipo_negocio?: string
          usuario_proprietario_id?: string
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          ativo: boolean | null
          cnpj_cpf: string | null
          contato: Json | null
          criado_em: string | null
          empresa_id: string
          id: string
          nome: string
          observacoes: string | null
        }
        Insert: {
          ativo?: boolean | null
          cnpj_cpf?: string | null
          contato?: Json | null
          criado_em?: string | null
          empresa_id: string
          id?: string
          nome: string
          observacoes?: string | null
        }
        Update: {
          ativo?: boolean | null
          cnpj_cpf?: string | null
          contato?: Json | null
          criado_em?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          observacoes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_itens: {
        Row: {
          contado_por: string | null
          data_contagem: string | null
          diferenca: number | null
          id: string
          inventario_id: string
          observacoes: string | null
          produto_id: string
          quantidade_contada: number | null
          quantidade_sistema: number
        }
        Insert: {
          contado_por?: string | null
          data_contagem?: string | null
          diferenca?: number | null
          id?: string
          inventario_id: string
          observacoes?: string | null
          produto_id: string
          quantidade_contada?: number | null
          quantidade_sistema: number
        }
        Update: {
          contado_por?: string | null
          data_contagem?: string | null
          diferenca?: number | null
          id?: string
          inventario_id?: string
          observacoes?: string | null
          produto_id?: string
          quantidade_contada?: number | null
          quantidade_sistema?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventario_itens_inventario_id_fkey"
            columns: ["inventario_id"]
            isOneToOne: false
            referencedRelation: "inventarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "view_produtos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      inventarios: {
        Row: {
          categoria_ids: string[] | null
          criado_em: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
          observacoes: string | null
          responsavel_id: string
          status: string | null
        }
        Insert: {
          categoria_ids?: string[] | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          observacoes?: string | null
          responsavel_id: string
          status?: string | null
        }
        Update: {
          categoria_ids?: string[] | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
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
      movimentacoes_estoque: {
        Row: {
          criado_em: string | null
          data_movimentacao: string | null
          documento_numero: string | null
          documento_tipo: string | null
          empresa_id: string
          fornecedor_cliente: string | null
          id: string
          motivo: string
          observacoes: string | null
          produto_id: string
          quantidade: number
          quantidade_anterior: number
          quantidade_posterior: number
          subtipo: string | null
          tipo: string
          usuario_id: string
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          criado_em?: string | null
          data_movimentacao?: string | null
          documento_numero?: string | null
          documento_tipo?: string | null
          empresa_id: string
          fornecedor_cliente?: string | null
          id?: string
          motivo: string
          observacoes?: string | null
          produto_id: string
          quantidade: number
          quantidade_anterior: number
          quantidade_posterior: number
          subtipo?: string | null
          tipo: string
          usuario_id: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          criado_em?: string | null
          data_movimentacao?: string | null
          documento_numero?: string | null
          documento_tipo?: string | null
          empresa_id?: string
          fornecedor_cliente?: string | null
          id?: string
          motivo?: string
          observacoes?: string | null
          produto_id?: string
          quantidade?: number
          quantidade_anterior?: number
          quantidade_posterior?: number
          subtipo?: string | null
          tipo?: string
          usuario_id?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "view_produtos_completos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          atualizado_por: string | null
          campos_extras: Json | null
          categoria_id: string | null
          codigo_barras: string | null
          codigo_interno: string
          criado_em: string | null
          criado_por: string | null
          data_ultima_entrada: string | null
          data_ultima_saida: string | null
          data_validade: string | null
          descricao: string | null
          dimensoes: Json | null
          empresa_id: string
          estoque_atual: number | null
          estoque_maximo: number | null
          estoque_minimo: number | null
          fornecedor_id: string | null
          id: string
          imagens: string[] | null
          localizacao: Json | null
          margem_lucro: number | null
          nome: string
          observacoes: string | null
          peso: number | null
          preco_custo: number | null
          preco_venda: number | null
          unidade_medida: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          campos_extras?: Json | null
          categoria_id?: string | null
          codigo_barras?: string | null
          codigo_interno: string
          criado_em?: string | null
          criado_por?: string | null
          data_ultima_entrada?: string | null
          data_ultima_saida?: string | null
          data_validade?: string | null
          descricao?: string | null
          dimensoes?: Json | null
          empresa_id: string
          estoque_atual?: number | null
          estoque_maximo?: number | null
          estoque_minimo?: number | null
          fornecedor_id?: string | null
          id?: string
          imagens?: string[] | null
          localizacao?: Json | null
          margem_lucro?: number | null
          nome: string
          observacoes?: string | null
          peso?: number | null
          preco_custo?: number | null
          preco_venda?: number | null
          unidade_medida?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          campos_extras?: Json | null
          categoria_id?: string | null
          codigo_barras?: string | null
          codigo_interno?: string
          criado_em?: string | null
          criado_por?: string | null
          data_ultima_entrada?: string | null
          data_ultima_saida?: string | null
          data_validade?: string | null
          descricao?: string | null
          dimensoes?: Json | null
          empresa_id?: string
          estoque_atual?: number | null
          estoque_maximo?: number | null
          estoque_minimo?: number | null
          fornecedor_id?: string | null
          id?: string
          imagens?: string[] | null
          localizacao?: Json | null
          margem_lucro?: number | null
          nome?: string
          observacoes?: string | null
          peso?: number | null
          preco_custo?: number | null
          preco_venda?: number | null
          unidade_medida?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      relacionamentos_empresa: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          criado_em: string | null
          fornecedor_id: string
          id: string
          loja_id: string
          observacoes: string | null
          permissoes: Json | null
          status: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string | null
          fornecedor_id: string
          id?: string
          loja_id: string
          observacoes?: string | null
          permissoes?: Json | null
          status?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          criado_em?: string | null
          fornecedor_id?: string
          id?: string
          loja_id?: string
          observacoes?: string | null
          permissoes?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      tokens_ambiente: {
        Row: {
          ambiente_id: string
          ativo: boolean | null
          criado_em: string | null
          criado_por: string
          expires_at: string | null
          id: string
          nome: string
          permissoes: Json | null
          tipo: string | null
          token: string
          ultimo_uso: string | null
        }
        Insert: {
          ambiente_id: string
          ativo?: boolean | null
          criado_em?: string | null
          criado_por: string
          expires_at?: string | null
          id?: string
          nome: string
          permissoes?: Json | null
          tipo?: string | null
          token: string
          ultimo_uso?: string | null
        }
        Update: {
          ambiente_id?: string
          ativo?: boolean | null
          criado_em?: string | null
          criado_por?: string
          expires_at?: string | null
          id?: string
          nome?: string
          permissoes?: Json | null
          tipo?: string | null
          token?: string
          ultimo_uso?: string | null
        }
        Relationships: []
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
      usuarios_empresa: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          empresa_id: string
          id: string
          permissoes: Json | null
          role: string
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          empresa_id: string
          id?: string
          permissoes?: Json | null
          role?: string
          usuario_id: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          empresa_id?: string
          id?: string
          permissoes?: Json | null
          role?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
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
      view_produtos_completos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          atualizado_por: string | null
          campos_extras: Json | null
          categoria_cor: string | null
          categoria_id: string | null
          categoria_nome: string | null
          codigo_barras: string | null
          codigo_interno: string | null
          criado_em: string | null
          criado_por: string | null
          data_ultima_entrada: string | null
          data_ultima_saida: string | null
          data_validade: string | null
          descricao: string | null
          dimensoes: Json | null
          empresa_id: string | null
          entradas_mes: number | null
          estoque_atual: number | null
          estoque_baixo: boolean | null
          estoque_maximo: number | null
          estoque_minimo: number | null
          fornecedor_id: string | null
          fornecedor_nome: string | null
          id: string | null
          imagens: string[] | null
          localizacao: Json | null
          margem_lucro: number | null
          nome: string | null
          observacoes: string | null
          peso: number | null
          preco_custo: number | null
          preco_venda: number | null
          produto_vencendo: boolean | null
          saidas_mes: number | null
          unidade_medida: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_api_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_company_id: {
        Args: { user_id: string }
        Returns: string
      }
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
