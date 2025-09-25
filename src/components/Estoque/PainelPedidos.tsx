import { useState, useEffect } from 'react'
import { Package, Send, CheckCircle, AlertTriangle, Filter, Calendar, Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEstoque } from '@/hooks/useEstoque'
import { usePedidos } from '@/contexts/PedidosContext'
import type { ProdutoComStatus } from '@/types/pedidos'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { HistoricoPedido } from './HistoricoPedido'

export function PainelPedidos() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState('7d')
  const [activeTab, setActiveTab] = useState('pendentes')
  const [showHistorico, setShowHistorico] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoComStatus | null>(null)

  const { produtosCriticos, loading, fetchProdutosCriticos } = usePedidos()
  const { categorias } = useEstoque()

  useEffect(() => {
    fetchProdutosCriticos()
  }, [fetchProdutosCriticos])

  // Filtrar produtos com base nos critérios
  const produtosFiltrados = produtosCriticos.filter(produto => {
    const nome = produto.nome.toLowerCase()
    const codigo = produto.codigo_interno?.toLowerCase() || ''
    const matchesSearch = nome.includes(searchTerm.toLowerCase()) || 
                         codigo.includes(searchTerm.toLowerCase())

    const matchesStatus = filtroStatus === 'todos' || 
                         produto.status_pedido === filtroStatus

    // TODO: Implementar filtro por período usando ultima_atualizacao_pedido

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDENTE':
        return <Badge variant="secondary">Pendente</Badge>
      case 'ENVIADO_N8N':
        return <Badge className="bg-blue-100 text-blue-800">Enviado</Badge>
      case 'RESOLVIDO':
        return <Badge className="bg-green-100 text-green-800">Resolvido</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  if (showHistorico && produtoSelecionado) {
    return (
      <HistoricoPedido 
        produto={produtoSelecionado}
        onVoltar={() => {
          setShowHistorico(false)
          setProdutoSelecionado(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
        <Button onClick={() => fetchProdutosCriticos()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pedidos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtosCriticos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendentes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {produtosCriticos.filter(p => !p.status_pedido || p.status_pedido === 'PENDENTE').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Processamento
            </CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {produtosCriticos.filter(p => p.status_pedido === 'ENVIADO_N8N').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolvidos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {produtosCriticos.filter(p => p.status_pedido === 'RESOLVIDO').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="ENVIADO_N8N">Em Processamento</SelectItem>
            <SelectItem value="RESOLVIDO">Resolvido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="15d">Últimos 15 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="todos">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Produtos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando pedidos...</p>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Não foram encontrados pedidos com os filtros selecionados.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {produtosFiltrados.map((produto) => (
            <Card key={produto.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{produto.nome}</h3>
                        {produto.codigo_interno && (
                          <p className="text-sm text-muted-foreground">
                            Código: {produto.codigo_interno}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(produto.status_pedido)}
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Estoque Atual</p>
                        <p className="text-lg font-semibold">{produto.estoque_atual}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                        <p className="text-lg font-semibold">{produto.estoque_minimo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Última Atualização</p>
                        <p className="text-sm">
                          {produto.ultima_atualizacao_pedido 
                            ? format(new Date(produto.ultima_atualizacao_pedido), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Atualizado por</p>
                        <p className="text-sm">{produto.usuario_ultima_atualizacao || '-'}</p>
                      </div>
                    </div>

                    {produto.observacoes_pedido && (
                      <p className="mt-4 text-sm text-muted-foreground">
                        Obs: {produto.observacoes_pedido}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProdutoSelecionado(produto)
                        setShowHistorico(true)
                      }}
                    >
                      Histórico
                    </Button>
                    {(!produto.status_pedido || produto.status_pedido === 'PENDENTE') && (
                      <Button 
                        onClick={() => {
                          // TODO: Implementar envio para n8n
                        }}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Enviar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}