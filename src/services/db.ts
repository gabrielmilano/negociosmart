import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase.types';

type EstoqueItem = Database['public']['Tables']['estoque']['Row'];

interface MovimentoEstoque {
  produto_id: string;
  quantidade: number;
  tipo: 'entrada' | 'saida';
  data: string;
  observacao?: string;
}

export class DatabaseService {
  /**
   * Busca todos os itens do estoque que estão abaixo do estoque mínimo
   * @returns Promise<EstoqueItem[]> Lista de itens críticos
   * @throws {PostgrestError} Erro ao buscar itens
   */
  static async getEstoqueCritico(): Promise<{ data: EstoqueItem[] | null; error: PostgrestError | null }> {
    return await supabase
      .from('estoque')
      .select('*')
      .lt('quantidade_atual', 'estoque_minimo');
  }

  /**
   * Registra uma movimentação no estoque e atualiza a quantidade do produto
   * @param movimento Dados da movimentação
   * @returns Promise<void>
   * @throws {PostgrestError} Erro ao registrar movimento
   */
  static async registrarMovimentoEstoque(movimento: MovimentoEstoque): Promise<{ error: PostgrestError | null }> {
    const { data: produto, error: selectError } = await supabase
      .from('estoque')
      .select('quantidade_atual')
      .eq('id', movimento.produto_id)
      .single();

    if (selectError) {
      return { error: selectError };
    }

    if (!produto) {
      return { error: { message: 'Produto não encontrado', details: '', hint: '', code: '404' } as PostgrestError };
    }

    const novaQuantidade = movimento.tipo === 'entrada' 
      ? produto.quantidade_atual + movimento.quantidade
      : produto.quantidade_atual - movimento.quantidade;

    // Inicia uma transação para garantir consistência
    const { error: transactionError } = await supabase.rpc('movimentar_estoque', {
      p_produto_id: movimento.produto_id,
      p_quantidade: movimento.quantidade,
      p_tipo: movimento.tipo,
      p_data: movimento.data,
      p_observacao: movimento.observacao || '',
      p_nova_quantidade: novaQuantidade
    });

    return { error: transactionError };
  }
}