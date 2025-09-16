import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { Database } from '@/integrations/supabase/types'

type Produto = Database['public']['Views']['view_produtos_completos']['Row']
type MovimentacaoEstoque = Database['public']['Tables']['movimentacoes_estoque']['Row'] & {
  usuario_nome?: string
  produto_nome?: string
  categoria_nome?: string
}
type Categoria = Database['public']['Tables']['categorias_produto']['Row']
type Fornecedor = Database['public']['Tables']['fornecedores']['Row']
type Inventario = Database['public']['Tables']['inventarios']['Row']
type InventarioItem = Database['public']['Tables']['inventario_itens']['Row'] & {
  produto_nome?: string
  produto_codigo?: string
}

interface EstoqueContextType {
  produtos: Produto[]
  movimentacoes: MovimentacaoEstoque[]
  categorias: Categoria[]
  fornecedores: Fornecedor[]
  inventarios: Inventario[]
  inventarioItens: InventarioItem[]
  loading: boolean
  empresaAtual?: string
  
  // Produtos
  fetchProdutos: () => Promise<void>
  buscarProdutoPorCodigo: (codigo: string) => Promise<Produto | null>
  criarProduto: (dados: any) => Promise<any | null>
  atualizarProduto: (id: string, dados: any) => Promise<boolean>
  excluirProduto: (id: string) => Promise<boolean>
  
  // Movimentações
  registrarMovimentacao: (dados: {
    produto_id: string
    tipo: 'entrada' | 'saida' | 'ajuste'
    quantidade: number
    valor_unitario?: number
    motivo: string
    observacoes?: string
    documento_numero?: string
    fornecedor_cliente?: string
  }) => Promise<boolean>
  fetchMovimentacoesProduto: (produtoId: string) => Promise<void>
  fetchTodasMovimentacoes: (filtros?: {
    tipo?: string
    dataInicio?: string
    dataFim?: string
    produtoId?: string
  }) => Promise<void>
  
  // Categorias
  fetchCategorias: () => Promise<void>
  criarCategoria: (dados: any) => Promise<Categoria | null>
  atualizarCategoria: (id: string, dados: any) => Promise<boolean>
  
  // Fornecedores
  fetchFornecedores: () => Promise<void>
  criarFornecedor: (dados: any) => Promise<Fornecedor | null>
  atualizarFornecedor: (id: string, dados: any) => Promise<boolean>
  
  // Inventários
  fetchInventarios: () => Promise<void>
  criarInventario: (dados: any) => Promise<Inventario | null>
  atualizarInventario: (id: string, dados: any) => Promise<boolean>
  finalizarInventario: (id: string) => Promise<boolean>
  fetchInventarioItens: (inventarioId: string) => Promise<void>
  atualizarItemInventario: (itemId: string, quantidade: number, observacoes?: string) => Promise<boolean>
  aplicarInventario: (inventarioId: string) => Promise<boolean>
  
  // Relatórios
  getRelatorioDashboard: () => {
    totalProdutos: number
    produtosAtivos: number
    produtosEstoqueBaixo: number
    produtosVencendo: number
    valorTotalEstoque: number
    alertas: string[]
  }
}

const EstoqueContext = createContext<EstoqueContextType | undefined>(undefined)

export const EstoqueProvider: React.FC<{ children: ReactNode; empresaId?: string }> = ({ 
  children, 
  empresaId 
}) => {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [inventarios, setInventarios] = useState<Inventario[]>([])
  const [inventarioItens, setInventarioItens] = useState<InventarioItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Buscar todos os produtos
  const fetchProdutos = useCallback(async () => {
    if (!empresaId) return

    setLoading(true)
    const { data, error } = await supabase
      .from('view_produtos_completos')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('ativo', true)
      .order('nome')

    if (data && !error) {
      setProdutos(data as any[])
    } else if (error) {
      toast.error('Erro ao carregar produtos')
      console.error(error)
    }
    setLoading(false)
  }, [empresaId])

  // Buscar produto por código de barras ou código interno
  const buscarProdutoPorCodigo = useCallback(async (codigo: string) => {
    if (!empresaId || !codigo) return null

    const { data, error } = await supabase
      .from('view_produtos_completos')
      .select('*')
      .eq('empresa_id', empresaId)
      .or(`codigo_barras.eq.${codigo},codigo_interno.eq.${codigo}`)
      .eq('ativo', true)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar produto:', error)
      return null
    }

    return data
  }, [empresaId])

  // Criar novo produto
  const criarProduto = useCallback(async (dados: any) => {
    if (!empresaId || !user) return null

    // Gerar código interno se não fornecido
    if (!dados.codigo_interno) {
      dados.codigo_interno = `PROD_${Date.now()}`
    }

    const { data, error } = await supabase
      .from('produtos')
      .insert({
        ...dados,
        empresa_id: empresaId,
        criado_por: user.id,
        atualizado_por: user.id
      })
      .select()
      .single()

    if (data && !error) {
      toast.success('Produto criado com sucesso!')
      await fetchProdutos()
      return data
    } else {
      toast.error('Erro ao criar produto')
      console.error(error)
      return null
    }
  }, [empresaId, user, fetchProdutos])

  // Atualizar produto
  const atualizarProduto = useCallback(async (id: string, dados: any) => {
    if (!user) return false

    const { error } = await supabase
      .from('produtos')
      .update({
        ...dados,
        atualizado_por: user.id,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .eq('empresa_id', empresaId)

    if (!error) {
      toast.success('Produto atualizado!')
      await fetchProdutos()
      return true
    } else {
      toast.error('Erro ao atualizar produto')
      console.error(error)
      return false
    }
  }, [user, empresaId, fetchProdutos])

  // Excluir produto (soft delete)
  const excluirProduto = useCallback(async (id: string) => {
    if (!user) return false

    const { error } = await supabase
      .from('produtos')
      .update({ ativo: false, atualizado_por: user.id })
      .eq('id', id)
      .eq('empresa_id', empresaId)

    if (!error) {
      toast.success('Produto excluído!')
      await fetchProdutos()
      return true
    } else {
      toast.error('Erro ao excluir produto')
      console.error(error)
      return false
    }
  }, [user, empresaId, fetchProdutos])

  // Registrar movimentação de estoque
  const registrarMovimentacao = useCallback(async (dados: {
    produto_id: string
    tipo: 'entrada' | 'saida' | 'ajuste'
    quantidade: number
    valor_unitario?: number
    motivo: string
    observacoes?: string
    documento_numero?: string
    fornecedor_cliente?: string
  }) => {
    if (!empresaId || !user) return false

    try {
      // Buscar estoque atual do produto
      const { data: produto, error: produtoError } = await supabase
        .from('produtos')
        .select('estoque_atual, estoque_minimo')
        .eq('id', dados.produto_id)
        .eq('empresa_id', empresaId)
        .single()

      if (produtoError || !produto) {
        toast.error('Produto não encontrado')
        return false
      }

      // Validar estoque para saída
      const estoqueAtual = produto.estoque_atual ?? 0
      if (dados.tipo === 'saida' && dados.quantidade > estoqueAtual) {
        toast.error(`Estoque insuficiente. Disponível: ${estoqueAtual}`)
        return false
      }

      // Calcular quantidade posterior
      let quantidadePosterior = estoqueAtual
      if (dados.tipo === 'entrada') {
        quantidadePosterior = estoqueAtual + dados.quantidade
      } else if (dados.tipo === 'saida') {
        quantidadePosterior = estoqueAtual - dados.quantidade
      } else if (dados.tipo === 'ajuste') {
        quantidadePosterior = dados.quantidade
      }

      // Preparar dados da movimentação
      const movimentacaoData = {
        ...dados,
        empresa_id: empresaId,
        usuario_id: user.id,
        quantidade_anterior: estoqueAtual,
        quantidade_posterior: quantidadePosterior,
        valor_total: dados.valor_unitario ? dados.valor_unitario * dados.quantidade : undefined,
        data_movimentacao: new Date().toISOString()
      }

      // Usar transação para garantir consistência
      const { error: movimentacaoError } = await supabase
        .from('movimentacoes_estoque')
        .insert(movimentacaoData)

      if (movimentacaoError) {
        toast.error('Erro ao registrar movimentação')
        console.error(movimentacaoError)
        return false
      }

      // Atualizar estoque do produto
      const { error: updateError } = await supabase
        .from('produtos')
        .update({
          estoque_atual: quantidadePosterior,
          data_ultima_entrada: dados.tipo === 'entrada' ? new Date().toISOString() : undefined,
          data_ultima_saida: dados.tipo === 'saida' ? new Date().toISOString() : undefined,
          atualizado_em: new Date().toISOString(),
          atualizado_por: user.id
        })
        .eq('id', dados.produto_id)
        .eq('empresa_id', empresaId)

      if (updateError) {
        toast.error('Erro ao atualizar estoque do produto')
        console.error(updateError)
        return false
      }

      // Verificar alertas de estoque baixo
      const estoqueMinimo = produto.estoque_minimo ?? 0
      if (quantidadePosterior <= estoqueMinimo && quantidadePosterior > 0) {
        toast.warning(`Atenção: Estoque baixo! Restam apenas ${quantidadePosterior} unidades`)
      } else if (quantidadePosterior === 0) {
        toast.error('Produto em ruptura de estoque!')
      }

      toast.success('Movimentação registrada com sucesso!')
      await fetchProdutos()
      return true

    } catch (error) {
      console.error('Erro inesperado:', error)
      toast.error('Erro inesperado ao processar movimentação')
      return false
    }
  }, [empresaId, user, fetchProdutos])

  // Buscar movimentações de um produto
  const fetchMovimentacoesProduto = useCallback(async (produtoId: string) => {
    if (!empresaId) return

    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select(`
        *,
        produtos!inner(nome, codigo_interno, codigo_barras)
      `)
      .eq('empresa_id', empresaId)
      .eq('produto_id', produtoId)
      .order('data_movimentacao', { ascending: false })
      .limit(50)

    if (data && !error) {
      const movimentacoesFormatadas = data.map(mov => ({
        ...mov,
        usuario_nome: 'Usuário',
        produto_nome: mov.produtos?.nome || 'Produto não encontrado'
      }))
      setMovimentacoes(movimentacoesFormatadas)
    }
  }, [empresaId])

  // Buscar todas as movimentações
  const fetchTodasMovimentacoes = useCallback(async (filtros?: {
    tipo?: string
    dataInicio?: string
    dataFim?: string
    produtoId?: string
  }) => {
    if (!empresaId) return

    let query = supabase
      .from('movimentacoes_estoque')
      .select(`
        *,
        produtos!inner(nome, codigo_interno, codigo_barras, categoria_nome: categorias_produto(nome))
      `)
      .eq('empresa_id', empresaId)
      .order('data_movimentacao', { ascending: false })
      .limit(100)

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo)
    }
    if (filtros?.produtoId) {
      query = query.eq('produto_id', filtros.produtoId)
    }
    if (filtros?.dataInicio) {
      query = query.gte('data_movimentacao', filtros.dataInicio)
    }
    if (filtros?.dataFim) {
      query = query.lte('data_movimentacao', filtros.dataFim)
    }

    const { data, error } = await query

    if (data && !error) {
      const movimentacoesFormatadas = data.map(mov => ({
        ...mov,
        usuario_nome: 'Usuário',
        produto_nome: mov.produtos?.nome || 'Produto não encontrado',
        categoria_nome: mov.produtos?.categoria_nome?.nome || 'Sem categoria'
      }))
      setMovimentacoes(movimentacoesFormatadas)
    }
  }, [empresaId])

  // Buscar categorias
  const fetchCategorias = useCallback(async () => {
    if (!empresaId) return

    const { data, error } = await supabase
      .from('categorias_produto')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('ativo', true)
      .order('nome')

    if (data && !error) {
      setCategorias(data)
    }
  }, [empresaId])

  // Criar categoria
  const criarCategoria = useCallback(async (dados: any) => {
    if (!empresaId) return null

    const { data, error } = await supabase
      .from('categorias_produto')
      .insert({
        ...dados,
        empresa_id: empresaId
      })
      .select()
      .single()

    if (data && !error) {
      toast.success('Categoria criada!')
      await fetchCategorias()
      return data
    } else {
      toast.error('Erro ao criar categoria')
      return null
    }
  }, [empresaId, fetchCategorias])

  // Atualizar categoria
  const atualizarCategoria = useCallback(async (id: string, dados: any) => {
    if (!empresaId) return false

    const { error } = await supabase
      .from('categorias_produto')
      .update(dados)
      .eq('id', id)
      .eq('empresa_id', empresaId)

    if (!error) {
      toast.success('Categoria atualizada!')
      await fetchCategorias()
      return true
    } else {
      toast.error('Erro ao atualizar categoria')
      console.error(error)
      return false
    }
  }, [empresaId, fetchCategorias])

  // Buscar fornecedores
  const fetchFornecedores = useCallback(async () => {
    if (!empresaId) return

    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('ativo', true)
      .order('nome')

    if (data && !error) {
      setFornecedores(data)
    }
  }, [empresaId])

  // Criar fornecedor
  const criarFornecedor = useCallback(async (dados: any) => {
    if (!empresaId) return null

    const { data, error } = await supabase
      .from('fornecedores')
      .insert({
        ...dados,
        empresa_id: empresaId
      })
      .select()
      .single()

    if (data && !error) {
      toast.success('Fornecedor criado!')
      await fetchFornecedores()
      return data
    } else {
      toast.error('Erro ao criar fornecedor')
      return null
    }
  }, [empresaId, fetchFornecedores])

  // Atualizar fornecedor
  const atualizarFornecedor = useCallback(async (id: string, dados: any) => {
    if (!empresaId) return false

    const { error } = await supabase
      .from('fornecedores')
      .update(dados)
      .eq('id', id)
      .eq('empresa_id', empresaId)

    if (!error) {
      toast.success('Fornecedor atualizado!')
      await fetchFornecedores()
      return true
    } else {
      toast.error('Erro ao atualizar fornecedor')
      console.error(error)
      return false
    }
  }, [empresaId, fetchFornecedores])

  // Buscar inventários
  const fetchInventarios = useCallback(async () => {
    if (!empresaId) return

    const { data, error } = await supabase
      .from('inventarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('criado_em', { ascending: false })

    if (data && !error) {
      setInventarios(data)
    }
  }, [empresaId])

  // Criar inventário
  const criarInventario = useCallback(async (dados: any) => {
    if (!empresaId || !user) return null

    const { data, error } = await supabase
      .from('inventarios')
      .insert({
        ...dados,
        empresa_id: empresaId,
        responsavel_id: user.id,
        status: 'planejado'
      })
      .select()
      .single()

    if (data && !error) {
      toast.success('Inventário criado!')
      await fetchInventarios()
      return data
    } else {
      toast.error('Erro ao criar inventário')
      console.error(error)
      return null
    }
  }, [empresaId, user, fetchInventarios])

  // Atualizar inventário
  const atualizarInventario = useCallback(async (id: string, dados: any) => {
    if (!empresaId) return false

    const { error } = await supabase
      .from('inventarios')
      .update(dados)
      .eq('id', id)
      .eq('empresa_id', empresaId)

    if (!error) {
      toast.success('Inventário atualizado!')
      await fetchInventarios()
      return true
    } else {
      toast.error('Erro ao atualizar inventário')
      console.error(error)
      return false
    }
  }, [empresaId, fetchInventarios])

  // Finalizar inventário
  const finalizarInventario = useCallback(async (id: string) => {
    if (!empresaId) return false

    const { error } = await supabase
      .from('inventarios')
      .update({ 
        status: 'finalizado',
        data_fim: new Date().toISOString()
      })
      .eq('id', id)
      .eq('empresa_id', empresaId)

    if (!error) {
      toast.success('Inventário finalizado!')
      await fetchInventarios()
      return true
    } else {
      toast.error('Erro ao finalizar inventário')
      console.error(error)
      return false
    }
  }, [empresaId, fetchInventarios])

  // Buscar itens do inventário
  const fetchInventarioItens = useCallback(async (inventarioId: string) => {
    if (!empresaId) return

    const { data, error } = await supabase
      .from('inventario_itens')
      .select(`
        *,
        produtos!inner(nome, codigo_interno, codigo_barras, unidade_medida)
      `)
      .eq('inventario_id', inventarioId)
      .order('produtos(nome)')

    if (data && !error) {
      const itensFormatados = data.map(item => ({
        ...item,
        produto_nome: item.produtos?.nome || 'Produto não encontrado',
        produto_codigo: item.produtos?.codigo_interno || ''
      }))
      setInventarioItens(itensFormatados)
    }
  }, [empresaId])

  // Atualizar item do inventário
  const atualizarItemInventario = useCallback(async (itemId: string, quantidade: number, observacoes?: string) => {
    if (!user) return false

    const { error } = await supabase
      .from('inventario_itens')
      .update({
        quantidade_contada: quantidade,
        observacoes: observacoes,
        contado_por: user.id,
        data_contagem: new Date().toISOString()
      })
      .eq('id', itemId)

    if (!error) {
      toast.success('Item atualizado!')
      return true
    } else {
      toast.error('Erro ao atualizar item')
      console.error(error)
      return false
    }
  }, [user])

  // Aplicar inventário (criar movimentações de ajuste)
  const aplicarInventario = useCallback(async (inventarioId: string) => {
    if (!empresaId || !user) return false

    try {
      // Buscar itens com diferenças
      const itensComDiferenca = inventarioItens.filter(item => 
        item.quantidade_contada !== null && 
        item.quantidade_contada !== item.quantidade_sistema
      )

      if (itensComDiferenca.length === 0) {
        toast.info('Nenhuma diferença encontrada para aplicar')
        return true
      }

      // Criar movimentações de ajuste para cada item
      for (const item of itensComDiferenca) {
        const { error } = await supabase
          .from('movimentacoes_estoque')
          .insert({
            empresa_id: empresaId,
            produto_id: item.produto_id,
            tipo: 'ajuste',
            subtipo: 'inventario',
            quantidade: Math.abs(item.diferenca || 0),
            quantidade_anterior: item.quantidade_sistema,
            quantidade_posterior: item.quantidade_contada || 0,
            motivo: `Ajuste por inventário físico - ${item.observacoes || 'Sem observações'}`,
            observacoes: `Inventário ID: ${inventarioId}`,
            usuario_id: user.id,
            data_movimentacao: new Date().toISOString()
          })

        if (error) {
          console.error('Erro ao criar movimentação:', error)
        }
      }

      // Atualizar estoque dos produtos
      for (const item of itensComDiferenca) {
        const { error } = await supabase
          .from('produtos')
          .update({
            estoque_atual: item.quantidade_contada || 0,
            atualizado_em: new Date().toISOString(),
            atualizado_por: user.id
          })
          .eq('id', item.produto_id)
          .eq('empresa_id', empresaId)

        if (error) {
          console.error('Erro ao atualizar estoque:', error)
        }
      }

      toast.success(`Inventário aplicado! ${itensComDiferenca.length} itens ajustados.`)
      await fetchProdutos()
      await fetchTodasMovimentacoes()
      return true

    } catch (error) {
      console.error('Erro ao aplicar inventário:', error)
      toast.error('Erro ao aplicar inventário')
      return false
    }
  }, [empresaId, user, inventarioItens, fetchProdutos, fetchTodasMovimentacoes])

  // Relatórios
  const getRelatorioDashboard = useCallback(() => {
    const totalProdutos = produtos.length
    const produtosAtivos = produtos.filter(p => !!p.ativo).length
    const produtosEstoqueBaixo = produtos.filter(p => !!p.estoque_baixo).length
    const produtosVencendo = produtos.filter(p => !!p.produto_vencendo).length
    const valorTotalEstoque = produtos.reduce((total, p) => {
      const estoque = p.estoque_atual ?? 0
      const custo = p.preco_custo ?? 0
      return total + estoque * custo
    }, 0)

    return {
      totalProdutos,
      produtosAtivos,
      produtosEstoqueBaixo,
      produtosVencendo,
      valorTotalEstoque,
      alertas: [
        ...(produtosEstoqueBaixo > 0 ? [`${produtosEstoqueBaixo} produtos com estoque baixo`] : []),
        ...(produtosVencendo > 0 ? [`${produtosVencendo} produtos vencendo em 30 dias`] : [])
      ]
    }
  }, [produtos])

  useEffect(() => {
    if (empresaId) {
      fetchProdutos()
      fetchCategorias()
      fetchFornecedores()
      fetchInventarios()
    }
  }, [empresaId, fetchProdutos, fetchCategorias, fetchFornecedores, fetchInventarios])

  return (
    <EstoqueContext.Provider value={{
      produtos,
      movimentacoes,
      categorias,
      fornecedores,
      inventarios,
      inventarioItens,
      loading,
      empresaAtual: empresaId,
      fetchProdutos,
      buscarProdutoPorCodigo,
      criarProduto,
      atualizarProduto,
      excluirProduto,
      registrarMovimentacao,
      fetchMovimentacoesProduto,
      fetchTodasMovimentacoes,
      fetchCategorias,
      criarCategoria,
      atualizarCategoria,
      fetchFornecedores,
      criarFornecedor,
      atualizarFornecedor,
      fetchInventarios,
      criarInventario,
      atualizarInventario,
      finalizarInventario,
      fetchInventarioItens,
      atualizarItemInventario,
      aplicarInventario,
      getRelatorioDashboard
    }}>
      {children}
    </EstoqueContext.Provider>
  )
}

export const useEstoque = () => {
  const context = useContext(EstoqueContext)
  if (context === undefined) {
    throw new Error('useEstoque must be used within an EstoqueProvider')
  }
  return context
}