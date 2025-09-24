// /supabase/functions/estoque-movimento/index.ts

import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

interface MovimentoEstoque {
  produto_id: string;
  quantidade: number;
  tipo: 'entrada' | 'saida';
  data: string;
  observacao?: string;
}

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verificar API key
  const apiKey = req.headers.get('x-api-key');
  const expectedKey = Deno.env.get('API_KEY');

  if (!apiKey || apiKey !== expectedKey) {
    return new Response(
      JSON.stringify({
        error: 'Invalid API key'
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const movimento: MovimentoEstoque = await req.json();

    // Buscar produto atual
    const { data: produto, error: selectError } = await supabaseClient
      .from('estoque')
      .select('quantidade_atual')
      .eq('id', movimento.produto_id)
      .single();

    if (selectError) throw selectError;
    if (!produto) throw new Error('Produto não encontrado');

    const novaQuantidade = movimento.tipo === 'entrada' 
      ? produto.quantidade_atual + movimento.quantidade
      : produto.quantidade_atual - movimento.quantidade;

    // Registrar movimentação e atualizar estoque em uma transação
    const { error: transactionError } = await supabaseClient.rpc('movimentar_estoque', {
      p_produto_id: movimento.produto_id,
      p_quantidade: movimento.quantidade,
      p_tipo: movimento.tipo,
      p_data: movimento.data,
      p_observacao: movimento.observacao || '',
      p_nova_quantidade: novaQuantidade
    });

    if (transactionError) throw transactionError;

    return new Response(
      JSON.stringify({
        success: true,
        quantidade_atual: novaQuantidade
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});