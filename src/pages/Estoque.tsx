import React, { useState, useEffect } from 'react'
import { Plus, Package, Search, Filter, BarChart3, AlertTriangle, Calendar, TrendingUp, TrendingDown, Scan, Tag, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EstoqueProvider, useEstoque } from '@/hooks/useEstoque'
import { ProdutoForm } from '@/components/Estoque/ProdutoForm'
import { MovimentacaoForm } from '@/components/Estoque/MovimentacaoForm'
import { BarcodeScanner } from '@/components/Estoque/BarcodeScanner'
import { CategoriaForm } from '@/components/Estoque/CategoriaForm'
import { FornecedorForm } from '@/components/Estoque/FornecedorForm'

const EstoqueContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('produtos')
  const [showProdutoForm, setShowProdutoForm] = useState(false)
  const [showMovimentacaoForm, setShowMovimentacaoForm] = useState(false)
  const [showCategoriaForm, setShowCategoriaForm] = useState(false)
  const [showFornecedorForm, setShowFornecedorForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [fornecedorEditando, setFornecedorEditando] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [quickScanMode, setQuickScanMode] = useState(false)

  const {
    produtos,
    loading,
    categorias,
    fornecedores,
    criarProduto,
    atualizarProduto,
    criarCategoria,
    criarFornecedor,
    registrarMovimentacao,
    buscarProdutoPorCodigo,
    getRelatorioDashboard
  } = useEstoque()

  const dashboard = getRelatorioDashboard()

  // Filtrar produtos
  const produtosFiltrados = produtos.filter((produto) => {
    const nome = (produto.nome ?? '').toLowerCase()
    const codigoInterno = (produto.codigo_interno ?? '').toLowerCase()
    const codigoBarras = produto.codigo_barras ?? ''
    const matchesSearch =
      nome.includes(searchTerm.toLowerCase()) ||
      codigoInterno.includes(searchTerm.toLowerCase()) ||
      (codigoBarras && codigoBarras.includes(searchTerm))

    const matchesCategoria = filtroCategoria === 'todas' || produto.categoria_id === filtroCategoria

    const estoqueAtual = produto.estoque_atual ?? 0
    const matchesStatus =
      filtroStatus === 'todos' ||
      (filtroStatus === 'estoque_baixo' && !!produto.estoque_baixo) ||
      (filtroStatus === 'vencendo' && !!produto.produto_vencendo) ||
      (filtroStatus === 'sem_estoque' && estoqueAtual === 0)

    return matchesSearch && matchesCategoria && matchesStatus
  })

  const handleSaveProduto = async (dados: any) => {
    if (produtoEditando) {
      await atualizarProduto(produtoEditando.id, dados)
    } else {
      await criarProduto(dados)
    }
    setShowProdutoForm(false)
    setProdutoEditando(null)
  }

  const handleSaveMovimentacao = async (dados: any) => {
    await registrarMovimentacao(dados)
    setShowMovimentacaoForm(false)
  }

  const handleSaveCategoria = async (dados: any) => {
    if (categoriaEditando) {
      // TODO: Implementar atualização de categoria
      console.log('Atualizar categoria:', categoriaEditando.id, dados)
    } else {
      await criarCategoria(dados)
    }
    setShowCategoriaForm(false)
    setCategoriaEditando(null)
  }

  const handleSaveFornecedor = async (dados: any) => {
    if (fornecedorEditando) {
      // TODO: Implementar atualização de fornecedor
      console.log('Atualizar fornecedor:', fornecedorEditando.id, dados)
    } else {
      await criarFornecedor(dados)
    }
    setShowFornecedorForm(false)
    setFornecedorEditando(null)
  }

  const handleBarcodeScanned = async (codigo: string) => {
    try {
      const produto = await buscarProdutoPorCodigo(codigo)
      if (produto) {
        // Filtrar para mostrar apenas este produto
        setSearchTerm(codigo)
        // Focar no produto encontrado
        alert(`Produto encontrado: ${produto.nome} - Estoque: ${produto.estoque_atual}`)
      } else {
        const criar = confirm(`Produto com código ${codigo} não encontrado. Deseja criar um novo produto?`)
        if (criar) {
          setShowProdutoForm(true)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      alert('Erro ao buscar produto. Tente novamente.')
    }
    setShowScanner(false)
  }

  // Modo de busca rápida por leitor de código de barras
  useEffect(() => {
    if (!quickScanMode) return

    let inputBuffer = ''
    let lastInputTime = 0

    const handleKeyPress = (event: KeyboardEvent) => {
      const currentTime = Date.now()
      
      // Se passou mais de 100ms desde a última entrada, limpa o buffer
      if (currentTime - lastInputTime > 100) {
        inputBuffer = ''
      }
      
      lastInputTime = currentTime

      // Se for Enter ou Tab, processa o código acumulado
      if (event.key === 'Enter' || event.key === 'Tab') {
        if (inputBuffer.length >= 4) { // Códigos de barras geralmente têm pelo menos 4 dígitos
          event.preventDefault()
          handleBarcodeScanned(inputBuffer.trim())
          return
        }
        inputBuffer = ''
      } 
      // Se for um caractere válido, adiciona ao buffer
      else if (event.key.length === 1 && (event.key.match(/[0-9a-zA-Z]/) || event.key === '-' || event.key === '_')) {
        inputBuffer += event.key
      }
    }

    document.addEventListener('keypress', handleKeyPress)
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress)
    }
  }, [quickScanMode])

  const getStatusBadge = (produto: any) => {
    if ((produto.estoque_atual ?? 0) === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    }
    if (produto.estoque_baixo) {
      return <Badge className="bg-orange-100 text-orange-800">Estoque Baixo</Badge>
    }
    if (produto.produto_vencendo) {
      return <Badge className="bg-yellow-100 text-yellow-800">Vencendo</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Normal</Badge>
  }

  if (showProdutoForm) {
    return (
      <ProdutoForm
        produto={produtoEditando}
        onSave={handleSaveProduto}
        onCancel={() => {
          setShowProdutoForm(false)
          setProdutoEditando(null)
        }}
      />
    )
  }

  if (showMovimentacaoForm) {
    return (
      <MovimentacaoForm
        onSave={handleSaveMovimentacao}
        onCancel={() => setShowMovimentacaoForm(false)}
      />
    )
  }

  if (showCategoriaForm) {
    return (
      <CategoriaForm
        categoria={categoriaEditando}
        onSave={handleSaveCategoria}
        onCancel={() => {
          setShowCategoriaForm(false)
          setCategoriaEditando(null)
        }}
      />
    )
  }

  if (showFornecedorForm) {
    return (
      <FornecedorForm
        fornecedor={fornecedorEditando}
        onSave={handleSaveFornecedor}
        onCancel={() => {
          setShowFornecedorForm(false)
          setFornecedorEditando(null)
        }}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
            <p className="text-muted-foreground">
              Gerencie produtos, movimentações e inventário
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowScanner(true)}
            className="flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>Scanner</span>
          </Button>
          <Button
            variant={quickScanMode ? "default" : "outline"}
            onClick={() => setQuickScanMode(!quickScanMode)}
            className="flex items-center space-x-2"
          >
            <Scan className="h-4 w-4" />
            <span>{quickScanMode ? 'Modo Ativo' : 'Modo Leitor'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCategoriaForm(true)}
            className="bg-gradient-warning text-warning-foreground"
          >
            <Tag className="mr-2 h-4 w-4" />
            Categoria
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFornecedorForm(true)}
            className="bg-gradient-secondary"
          >
            <Truck className="mr-2 h-4 w-4" />
            Fornecedor
          </Button>
          <Button
            onClick={() => setShowMovimentacaoForm(true)}
            className="bg-gradient-success"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Movimentação
          </Button>
          <Button
            onClick={() => setShowProdutoForm(true)}
            className="bg-gradient-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{dashboard.totalProdutos}</p>
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-orange-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{dashboard.produtosEstoqueBaixo}</p>
              <p className="text-sm text-muted-foreground">Estoque Baixo</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-yellow-200 rounded-lg">
              <Calendar className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{dashboard.produtosVencendo}</p>
              <p className="text-sm text-muted-foreground">Vencendo</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-green-200 rounded-lg">
              <BarChart3 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                R$ {dashboard.valorTotalEstoque.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {dashboard.alertas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dashboard.alertas.map((alerta, index) => (
                <li key={index} className="text-orange-700">• {alerta}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* Aba Produtos */}
        <TabsContent value="produtos" className="space-y-4">
          {/* Indicador do Modo Leitor */}
          {quickScanMode && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <Scan className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Modo Leitor de Código Ativo</p>
                    <p className="text-sm text-blue-600">
                      Use seu leitor de código de barras para buscar produtos automaticamente
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuickScanMode(false)}
                    className="ml-auto text-blue-600 hover:text-blue-800"
                  >
                    Desativar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, código interno ou código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.icone} {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="estoque_baixo">Estoque Baixo</SelectItem>
                <SelectItem value="vencendo">Vencendo</SelectItem>
                <SelectItem value="sem_estoque">Sem Estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Produtos */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filtroCategoria || filtroStatus
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando seu primeiro produto'
                }
              </p>
              <Button onClick={() => setShowProdutoForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtosFiltrados.map((produto) => (
                <Card key={produto.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold line-clamp-2">
                          {produto.nome}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {produto.codigo_interno}
                          {produto.codigo_barras && ` • ${produto.codigo_barras}`}
                        </p>
                      </div>
                      {getStatusBadge(produto)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {produto.categoria_nome && (
                      <Badge variant="outline" className="text-xs">
                        {produto.categoria_nome}
                      </Badge>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estoque:</span>
                        <p className="font-medium">
                          {produto.estoque_atual} {produto.unidade_medida}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Preço:</span>
                        <p className="font-medium">R$ {(produto.preco_venda ?? 0).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Imagem do produto */}
                    {produto.imagens && produto.imagens.length > 0 && (
                      <div className="mt-3">
                        <img
                          src={produto.imagens[0]}
                          alt={produto.nome}
                          className="w-full h-24 object-cover rounded-md border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    {typeof produto.localizacao === 'object' && produto.localizacao && 
                     ((produto.localizacao as any).setor || (produto.localizacao as any).prateleira) && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Local:</span>
                        <p className="font-medium">
                          {[(produto.localizacao as any).setor, (produto.localizacao as any).prateleira, (produto.localizacao as any).posicao]
                            .filter(Boolean)
                            .join('-')}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setProdutoEditando(produto)
                          setShowProdutoForm(true)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowMovimentacaoForm(true)}
                      >
                        Movimentar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Aba Categorias */}
        <TabsContent value="categorias" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Categorias de Produtos</h3>
            <Button onClick={() => setShowCategoriaForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando categorias...</p>
            </div>
          ) : categorias.length === 0 ? (
            <Card className="p-8 text-center">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie categorias para organizar melhor seus produtos
              </p>
              <Button onClick={() => setShowCategoriaForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Categoria
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map((categoria) => (
                <Card key={categoria.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <span 
                        className="text-2xl"
                        style={{ color: categoria.cor }}
                      >
                        {categoria.icone}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold">{categoria.nome}</h4>
                        {categoria.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {categoria.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        {produtos.filter(p => p.categoria_id === categoria.id).length} produtos
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCategoriaEditando(categoria)
                          setShowCategoriaForm(true)
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Aba Fornecedores */}
        <TabsContent value="fornecedores" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Fornecedores</h3>
            <Button onClick={() => setShowFornecedorForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando fornecedores...</p>
            </div>
          ) : fornecedores.length === 0 ? (
            <Card className="p-8 text-center">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Cadastre fornecedores para facilitar o controle de compras
              </p>
              <Button onClick={() => setShowFornecedorForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Fornecedor
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fornecedores.map((fornecedor) => (
                <Card key={fornecedor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">{fornecedor.nome}</h4>
                        {fornecedor.cnpj_cpf && (
                          <p className="text-sm text-muted-foreground">
                            {fornecedor.cnpj_cpf}
                          </p>
                        )}
                      </div>
                      
                      {fornecedor.contato && typeof fornecedor.contato === 'object' && (
                        <div className="space-y-1 text-sm">
                          {(fornecedor.contato as any).telefone && (
                            <p className="text-muted-foreground">
                              📞 {(fornecedor.contato as any).telefone}
                            </p>
                          )}
                          {(fornecedor.contato as any).email && (
                            <p className="text-muted-foreground">
                              ✉️ {(fornecedor.contato as any).email}
                            </p>
                          )}
                          {(fornecedor.contato as any).pessoa_contato && (
                            <p className="text-muted-foreground">
                              👤 {(fornecedor.contato as any).pessoa_contato}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <Badge variant="outline">
                          {produtos.filter(p => p.fornecedor_id === fornecedor.id).length} produtos
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFornecedorEditando(fornecedor)
                            setShowFornecedorForm(true)
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Aba Movimentações */}
        <TabsContent value="movimentacoes" className="space-y-4">
          <Card className="p-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Histórico de Movimentações</h3>
            <p className="text-muted-foreground">
              Em breve você poderá visualizar todo o histórico de movimentações
            </p>
          </Card>
        </TabsContent>

        {/* Aba Relatórios */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Relatórios e Analytics</h3>
            <p className="text-muted-foreground">
              Relatórios detalhados de estoque, movimentações e performance
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scanner de Código de Barras */}
      <BarcodeScanner
        isOpen={showScanner}
        onScanSuccess={handleBarcodeScanned}
        onClose={() => setShowScanner(false)}
      />
    </div>
  )
}

export default function Estoque() {
  // Por enquanto, vamos usar um ID de empresa fixo
  // Em produção, isso viria do contexto do usuário logado
  const empresaId = "empresa-demo-123"

  return (
    <EstoqueProvider empresaId={empresaId}>
      <EstoqueContent />
    </EstoqueProvider>
  )
}