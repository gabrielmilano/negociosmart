import { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProdutoComPedido, StatusPedido, AlteracaoStatusPedido, HistoricoStatusPedido } from '@/types/pedidos.types'
import { useUserMeta } from '@/hooks/useUserMeta'
import { useToast } from '@/hooks/use-toast'

interface PedidosContextData {
  produtosCriticos: ProdutoComPedido[]
  loading: boolean
  fetchProdutosCriticos: () => Promise<void>
  atualizarStatusPedido: (produtoId: string, status: StatusPedido, observacoes?: string) => Promise<void>
  enviarParaN8N: (produtoId: string) => Promise<void>
  buscarHistoricoPedido: (produtoId: string) => Promise<HistoricoStatusPedido[]>
}

const PedidosContext = createContext<PedidosContextData | undefined>(undefined)

export function PedidosProvider({ children }: { children: React.ReactNode }) {
  const [produtosCriticos, setProdutosCriticos] = useState<ProdutoComPedido[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useUserMeta()
  const { toast } = useToast()

  const fetchProdutosCriticos = useCallback(async () => {
    if (!user?.empresa_id) return
    
    setLoading(true)
    try {
      const { data: produtos, error } = await supabase
        .from('view_produtos_pedidos')
        .select('*')
        .lt('estoque_atual', 'estoque_minimo')
        .eq('status_pedido', 'PENDENTE')
        .eq('empresa_id', user.empresa_id)
        .returns<ProdutoComPedido[]>()

      if (error) throw error

      setProdutosCriticos(produtos)
    } catch (error) {
      console.error('Erro ao buscar produtos críticos:', error)
      toast({
        title: 'Erro ao carregar produtos',
        description: 'Não foi possível carregar a lista de produtos críticos.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const buscarHistoricoPedido = useCallback(async (produtoId: string) => {
    if (!user?.empresa_id) return []

    try {
      const { data: historico, error } = await supabase
        .from('historico_status_pedido')
        .select('*, usuario:users!historico_status_pedido_usuario_id_fkey(email)')
        .eq('produto_id', produtoId)
        .eq('empresa_id', user.empresa_id)
        .order('data', { ascending: false })
        .returns<HistoricoStatusPedido[]>()
      
      if (error) throw error

      return historico || []
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
      const novoHistorico = {
        produto_id: produtoId,
        status,
        data: new Date().toISOString(),
        observacoes,
        usuario_id: user.id,
        empresa_id: user.empresa_id
      }

      // Primeiro atualizamos o status no produto
      const { error: updateError } = await supabase
        .from('view_produtos_pedidos')
        .update({ status: status })
        .eq('id', produtoId)
        .eq('empresa_id', user.empresa_id)
        .returns<ProdutoComPedido[]>()

      if (updateError) throw updateError

      // Depois registramos o histórico
      const { error: historyError } = await supabase
        .from('historico_status_pedido')
        .insert([novoHistorico])
        .returns<HistoricoStatusPedido[]>()

      if (historyError) throw historyError

      // Atualizar lista local e incluir informações do histórico
      setProdutosCriticos(state => 
        state.map(p => 
          p.id === produtoId 
            ? { 
                ...p, 
                status_pedido: status,
                ultima_atualizacao_pedido: novoHistorico.data,
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

  return (
    <PedidosContext.Provider value={{
      produtosCriticos,
      loading,
      fetchProdutosCriticos,
      atualizarStatusPedido,
      enviarParaN8N,
      buscarHistoricoPedido
    }}>
      {children}
    </PedidosContext.Provider>
  )
}

export function usePedidos() {
  const context = useContext(PedidosContext)
  if (!context) {
    throw new Error('usePedidos deve ser usado dentro de um PedidosProvider')
  }
  return context
}