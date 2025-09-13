import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/sonner'

interface Produto {
  id: string
  empresa_id: string
  codigo_interno: string
  codigo_barras?: string
  nome: string
  descricao?: string
  categoria_id?: string
  fornecedor_id?: string
  preco_custo: number
  preco_venda: number
  margem_lucro: number
  estoque_atual: number
  estoque_minimo: number
  estoque_maximo: number
  unidade_medida: string
  localizacao: {
    setor: string
    prateleira: string
    posicao: string
  }
  peso?: number
  dimensoes: {
    altura?: number
    largura?: number
    profundidade?: number
  }
  data_validade?: string
  campos_extras: Record<string, any>
  imagens: string[]
  ativo: boolean
  observacoes?: string
  // Campos calculados
  categoria_nome?: string
  categoria_cor?: string
  fornecedor_nome?: string
  estoque_baixo?: boolean
  produto_vencendo?: boolean
  entradas_mes?: number
  saidas_mes?: number
}

interface MovimentacaoEstoque {
  id: string
  empresa_id: string
  produto_id: string
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia' | 'inventario'
  subtipo?: string
  quantidade: number
  quantidade_anterior: number
  quantidade_posterior: number
  valor_unitario?: number
  valor_total?: number
  documento_numero?: string
  documento_tipo?: string
  fornecedor_cliente?: string
  motivo: string
  observacoes?: string
  data_movimentacao: string
  usuario_id: string
  usuario_nome?: string
}

interface Categoria {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  cor: string
  icone: string
  categoria_pai_id?: string
  ativo: boolean
}

interface Fornecedor {
  id: string
  empresa_id: string
  nome: string
  cnpj_cpf?: string
  contato: {
    telefone: string
    email: string
    endereco: string
    pessoa_contato: string
  }
  observacoes?: string
  ativo: boolean
}

interface EstoqueContextType {
  produtos: Produto[]
  movimentacoes: MovimentacaoEstoque[]
  categorias: Categoria[]
  fornecedores: Fornecedor[]
  loading: boolean
  empresaAtual?: string
  
  // Produtos
  fetchProdutos: () => Promise<void>
  buscarProdutoPorCodigo: (codigo: string) => Promise<Produto | null>
  criarProduto: (dados: Omit<Produto, 'id' | 'empresa_id'>) => Promise<Produto | null>
  atualizarProduto: (id: string, dados: Partial<Produto>) => Promise<boolean>
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
  
  // Categorias
  fetchCategorias: () => Promise<void>
  criarCategoria: (dados: Omit<Categoria, 'id' | 'empresa_id'>) => Promise<Categoria | null>
  
  // Fornecedores
  fetchFornecedores: () => Promise<void>
  criarFornecedor: (dados: Omit<Fornecedor, 'id' | 'empresa_id'>) => Promise<Fornecedor | null>
  
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
      setProdutos(data)
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
  const criarProduto = useCallback(async (dados: Omit<Produto, 'id' | 'empresa_id'>) => {
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
  const atualizarProduto = useCallback(async (id: string, dados: Partial<Produto>) => {
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

    // Buscar estoque atual do produto
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .select('estoque_atual')
      .eq('id', dados.produto_id)
      .single()

    if (produtoError || !produto) {
      toast.error('Produto não encontrado')
      return false
    }

    // Preparar dados da movimentação
    const movimentacaoData = {
      ...dados,
      empresa_id: empresaId,
      usuario_id: user.id,
      quantidade_anterior: produto.estoque_atual,
      valor_total: dados.valor_unitario ? dados.valor_unitario * dados.quantidade : undefined
    }

    const { error } = await supabase
      .from('movimentacoes_estoque')
      .insert(movimentacaoData)

    if (!error) {
      toast.success('Movimentação registrada!')
      await fetchProdutos()
      return true
    } else {
      toast.error('Erro ao registrar movimentação')
      console.error(error)
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
        usuarios(nome)
      `)
      .eq('empresa_id', empresaId)
      .eq('produto_id', produtoId)
      .order('data_movimentacao', { ascending: false })
      .limit(50)

    if (data && !error) {
      const movimentacoesFormatadas = data.map(mov => ({
        ...mov,
        usuario_nome: mov.usuarios?.nome || 'Usuário não encontrado'
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
  const criarCategoria = useCallback(async (dados: Omit<Categoria, 'id' | 'empresa_id'>) => {
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
  const criarFornecedor = useCallback(async (dados: Omit<Fornecedor, 'id' | 'empresa_id'>) => {
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

  // Relatórios
  const getRelatorioDashboard = useCallback(() => {
    const totalProdutos = produtos.length
    const produtosAtivos = produtos.filter(p => p.ativo).length
    const produtosEstoqueBaixo = produtos.filter(p => p.estoque_baixo).length
    const produtosVencendo = produtos.filter(p => p.produto_vencendo).length
    const valorTotalEstoque = produtos.reduce((total, p) => 
      total + (p.estoque_atual * p.preco_custo), 0)

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
    }
  }, [empresaId, fetchProdutos, fetchCategorias, fetchFornecedores])

  return (
    <EstoqueContext.Provider value={{
      produtos,
      movimentacoes,
      categorias,
      fornecedores,
      loading,
      empresaAtual: empresaId,
      fetchProdutos,
      buscarProdutoPorCodigo,
      criarProduto,
      atualizarProduto,
      excluirProduto,
      registrarMovimentacao,
      fetchMovimentacoesProduto,
      fetchCategorias,
      criarCategoria,
      fetchFornecedores,
      criarFornecedor,
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