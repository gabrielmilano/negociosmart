import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity
} from 'lucide-react'
import { useEstoque } from '@/hooks/useEstoque'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const RelatoriosEstoque: React.FC = () => {
  const { produtos, movimentacoes, getRelatorioDashboard } = useEstoque()
  const [periodo, setPeriodo] = useState('30')
  const [relatorioData, setRelatorioData] = useState<any>(null)

  const dashboard = getRelatorioDashboard()

  useEffect(() => {
    calcularRelatorios()
  }, [produtos, movimentacoes, periodo])

  const calcularRelatorios = () => {
    const dias = parseInt(periodo)
    const dataInicio = subDays(new Date(), dias)
    
    // Filtrar movimentações do período
    const movimentacoesPeriodo = movimentacoes.filter(mov => {
      if (!mov.data_movimentacao) return false
      return new Date(mov.data_movimentacao) >= dataInicio
    })

    // Calcular estatísticas
    const totalEntradas = movimentacoesPeriodo
      .filter(mov => mov.tipo === 'entrada')
      .reduce((acc, mov) => acc + mov.quantidade, 0)

    const totalSaidas = movimentacoesPeriodo
      .filter(mov => mov.tipo === 'saida')
      .reduce((acc, mov) => acc + mov.quantidade, 0)

    const valorTotalEntradas = movimentacoesPeriodo
      .filter(mov => mov.tipo === 'entrada' && mov.valor_total)
      .reduce((acc, mov) => acc + (mov.valor_total || 0), 0)

    const valorTotalSaidas = movimentacoesPeriodo
      .filter(mov => mov.tipo === 'saida' && mov.valor_total)
      .reduce((acc, mov) => acc + (mov.valor_total || 0), 0)

    // Produtos mais movimentados
    const produtosMovimentados = movimentacoesPeriodo.reduce((acc, mov) => {
      const produtoId = mov.produto_id
      if (!acc[produtoId]) {
        acc[produtoId] = {
          nome: mov.produto_nome || 'Produto não encontrado',
          entradas: 0,
          saidas: 0,
          valor: 0
        }
      }
      
      if (mov.tipo === 'entrada') {
        acc[produtoId].entradas += mov.quantidade
      } else if (mov.tipo === 'saida') {
        acc[produtoId].saidas += mov.quantidade
      }
      
      acc[produtoId].valor += mov.valor_total || 0
      
      return acc
    }, {} as any)

    const topProdutos = Object.values(produtosMovimentados)
      .sort((a: any, b: any) => (b.entradas + b.saidas) - (a.entradas + a.saidas))
      .slice(0, 10)

    // Categorias mais movimentadas
    const categoriasMovimentadas = produtos.reduce((acc, produto) => {
      const categoria = produto.categoria_nome || 'Sem categoria'
      if (!acc[categoria]) {
        acc[categoria] = {
          nome: categoria,
          produtos: 0,
          estoque: 0,
          valor: 0
        }
      }
      
      acc[categoria].produtos += 1
      acc[categoria].estoque += produto.estoque_atual || 0
      acc[categoria].valor += (produto.estoque_atual || 0) * (produto.preco_custo || 0)
      
      return acc
    }, {} as any)

    const topCategorias = Object.values(categoriasMovimentadas)
      .sort((a: any, b: any) => b.estoque - a.estoque)
      .slice(0, 5)

    setRelatorioData({
      periodo: {
        dias,
        dataInicio: format(dataInicio, 'dd/MM/yyyy', { locale: ptBR }),
        dataFim: format(new Date(), 'dd/MM/yyyy', { locale: ptBR })
      },
      movimentacoes: {
        total: movimentacoesPeriodo.length,
        entradas: totalEntradas,
        saidas: totalSaidas,
        valorEntradas: valorTotalEntradas,
        valorSaidas: valorTotalSaidas
      },
      topProdutos,
      topCategorias
    })
  }

  const exportarRelatorio = (formato: 'pdf' | 'excel') => {
    // Implementar exportação
    alert(`Exportando relatório em ${formato.toUpperCase()}...`)
  }

  if (!relatorioData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Calculando relatórios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Relatórios de Estoque</h2>
          <p className="text-muted-foreground">
            Período: {relatorioData.periodo.dataInicio} a {relatorioData.periodo.dataFim}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportarRelatorio('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => exportarRelatorio('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {relatorioData.movimentacoes.entradas}
                </p>
                <p className="text-sm text-muted-foreground">Entradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {relatorioData.movimentacoes.saidas}
                </p>
                <p className="text-sm text-muted-foreground">Saídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {relatorioData.movimentacoes.total}
                </p>
                <p className="text-sm text-muted-foreground">Movimentações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboard.produtosEstoqueBaixo}
                </p>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="resumo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        {/* Resumo */}
        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Movimentações por Dia</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total de Entradas:</span>
                    <Badge variant="default">{relatorioData.movimentacoes.entradas} unidades</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total de Saídas:</span>
                    <Badge variant="destructive">{relatorioData.movimentacoes.saidas} unidades</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Saldo Líquido:</span>
                    <Badge variant={relatorioData.movimentacoes.entradas - relatorioData.movimentacoes.saidas >= 0 ? "default" : "destructive"}>
                      {relatorioData.movimentacoes.entradas - relatorioData.movimentacoes.saidas} unidades
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Valores Financeiros</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Valor Total Entradas:</span>
                    <span className="font-medium text-green-600">
                      R$ {relatorioData.movimentacoes.valorEntradas.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Valor Total Saídas:</span>
                    <span className="font-medium text-red-600">
                      R$ {relatorioData.movimentacoes.valorSaidas.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Valor Total Estoque:</span>
                    <span className="font-medium text-blue-600">
                      R$ {dashboard.valorTotalEstoque.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Produtos */}
        <TabsContent value="produtos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Produtos Mais Movimentados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatorioData.topProdutos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma movimentação no período selecionado
                </p>
              ) : (
                <div className="space-y-3">
                  {relatorioData.topProdutos.map((produto: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{produto.nome}</p>
                        <div className="flex space-x-4 text-sm text-muted-foreground">
                          <span>Entradas: {produto.entradas}</span>
                          <span>Saídas: {produto.saidas}</span>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {produto.entradas + produto.saidas} total
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categorias */}
        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Distribuição por Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatorioData.topCategorias.map((categoria: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{categoria.nome}</p>
                      <div className="flex space-x-4 text-sm text-muted-foreground">
                        <span>{categoria.produtos} produtos</span>
                        <span>Estoque: {categoria.estoque}</span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      R$ {categoria.valor.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Investimento em Estoque:</span>
                    <span className="font-medium">R$ {dashboard.valorTotalEstoque.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor de Entradas (Período):</span>
                    <span className="font-medium text-green-600">
                      R$ {relatorioData.movimentacoes.valorEntradas.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor de Saídas (Período):</span>
                    <span className="font-medium text-red-600">
                      R$ {relatorioData.movimentacoes.valorSaidas.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard.alertas.map((alerta, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-orange-50 border border-orange-200 rounded">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-orange-800 text-sm">{alerta}</span>
                    </div>
                  ))}
                  {dashboard.alertas.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum alerta no momento
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

