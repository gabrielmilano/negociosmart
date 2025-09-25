import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from './use-toast'
import { useUserMeta } from './useUserMeta'
import type { ProdutoComStatus, StatusPedido, HistoricoStatus } from '@/types/pedidos'

export function usePedidos() {
  const { user } = useUserMeta()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [produtosCriticos, setProdutosCriticos] = useState<ProdutoComStatus[]>([])

  const fetchProdutosCriticos = useCallback(async () => {
    if (!user?.empresa_id) return []
    
    try {
      setLoading(true)
      const { data: produtos, error } = await supabase
        .from('produtos')
        .select(`
          id,
          nome,
          codigo_interno,
          estoque_atual,
          estoque_minimo,
          estoque_maximo,
          status_pedido,
          ultima_atualizacao_pedido,
          observacoes_pedido,
          usuario_ultima_atualizacao
        `)
        .eq('empresa_id', user.empresa_id)
        .eq('status_pedido', 'PENDENTE')
        .lt('estoque_atual', 'estoque_minimo')

      if (error) throw error

      const pedidos = produtos.map(p => ({
        ...p,
        status_pedido: p.status_pedido || 'PENDENTE'
      }))

      setProdutosCriticos(pedidos)
      return pedidos
    } catch (error) {
      console.error('Erro ao buscar pedidos pendentes:', error)
      toast({
        title: 'Erro ao buscar pedidos',
        description: 'Não foi possível carregar os pedidos pendentes.',
        variant: 'destructive',
      })
      return []
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const buscarHistoricoPedido = useCallback(async (produtoId: string): Promise<HistoricoStatus[]> => {
    if (!user?.empresa_id) return []

    try {
      const { data, error } = await supabase
        .from('historico_status_pedido')
        .select(`
          id,
          produto_id,
          status,
          data,
          observacoes,
          usuario_id,
          usuario:usuario_id(email)
        `)
        .eq('produto_id', produtoId)
        .eq('empresa_id', user.empresa_id)
        .order('data', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao buscar histórico do pedido:', error)
      toast({
        title: 'Erro ao carregar histórico',
        description: 'Não foi possível carregar o histórico do pedido.',
        variant: 'destructive'
      })
      return []
    }
  }, [user, toast])

  const atualizarStatusPedido = useCallback(async (
    produtoId: string, 
    status: StatusPedido, 
    observacoes?: string
  ) => {
    if (!user?.empresa_id) return

    try {
      // 1. Atualizar produto
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ 
          status_pedido: status,
          ultima_atualizacao_pedido: new Date().toISOString(),
          observacoes_pedido: observacoes,
          usuario_ultima_atualizacao: user.email
        })
        .eq('id', produtoId)
        .eq('empresa_id', user.empresa_id)

      if (updateError) throw updateError

      // 2. Registrar no histórico
      const { error: historyError } = await supabase
        .from('historico_status_pedido')
        .insert([{
          produto_id: produtoId,
          status,
          data: new Date().toISOString(),
          observacoes,
          usuario_id: user.id,
          empresa_id: user.empresa_id
        }])

      if (historyError) throw historyError

      // 3. Atualizar lista local
      setProdutosCriticos(state => 
        state.map(p => 
          p.id === produtoId 
            ? { 
                ...p, 
                status_pedido: status,
                ultima_atualizacao_pedido: new Date().toISOString(),
                observacoes_pedido: observacoes,
                usuario_ultima_atualizacao: user.email
              }
            : p
        )
      )

      toast({
        title: 'Status atualizado',
        description: 'O status do pedido foi atualizado com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error)
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive'
      })
    }
  }, [user, toast])

  const enviarParaN8N = useCallback(async (produtoId: string) => {
    try {
      // 1. Atualizar status para ENVIADO_N8N
      await atualizarStatusPedido(produtoId, 'ENVIADO_N8N', 'Enviado para processamento no n8n')

      // 2. Chamar webhook do n8n (implementar conforme necessário)
      // const response = await fetch('URL_DO_WEBHOOK_N8N', {
      //   method: 'POST',
      //   body: JSON.stringify({ produto_id: produtoId }),
      // })

      // 3. Se o envio falhar, voltar para PENDENTE
      // if (!response.ok) {
      //   await atualizarStatusPedido(produtoId, 'PENDENTE', 'Falha no envio para n8n')
      //   throw new Error('Falha ao enviar para n8n')
      // }

      toast({
        title: 'Pedido enviado',
        description: 'O pedido foi enviado para processamento.',
      })
    } catch (error) {
      console.error('Erro ao enviar para n8n:', error)
      toast({
        title: 'Erro ao enviar pedido',
        description: 'Não foi possível enviar o pedido para processamento.',
        variant: 'destructive'
      })
    }
  }, [atualizarStatusPedido, toast])

  return {
    loading,
    produtosCriticos,
    fetchProdutosCriticos,
    atualizarStatusPedido,
    enviarParaN8N,
    buscarHistoricoPedido
  }
}