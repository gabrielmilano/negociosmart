import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, RotateCcw, Search, Filter, Calendar, Package, FileText, User } from 'lucide-react'
import { useEstoque } from '@/hooks/useEstoque'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface HistoricoMovimentacoesProps {
  produtoId?: string
}

export const HistoricoMovimentacoes: React.FC<HistoricoMovimentacoesProps> = ({ produtoId }) => {
  const { movimentacoes, loading, fetchTodasMovimentacoes, produtos } = useEstoque()
  const [filtros, setFiltros] = useState({
    tipo: '',
    dataInicio: '',
    dataFim: '',
    produtoId: produtoId || ''
  })
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetchTodasMovimentacoes(filtros)
  }, [filtros, fetchTodasMovimentacoes])

  const tiposMovimentacao = [
    { value: 'entrada', label: 'Entrada', icon: ArrowUp, color: 'text-green-600' },
    { value: 'saida', label: 'Saída', icon: ArrowDown, color: 'text-red-600' },
    { value: 'ajuste', label: 'Ajuste', icon: RotateCcw, color: 'text-blue-600' }
  ]

  const getTipoInfo = (tipo: string) => {
    return tiposMovimentacao.find(t => t.value === tipo) || tiposMovimentacao[0]
  }

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (
      mov.produto_nome?.toLowerCase().includes(termo) ||
      mov.motivo?.toLowerCase().includes(termo) ||
      mov.documento_numero?.toLowerCase().includes(termo) ||
      mov.fornecedor_cliente?.toLowerCase().includes(termo)
    )
  })

  const limparFiltros = () => {
    setFiltros({
      tipo: '',
      dataInicio: '',
      dataFim: '',
      produtoId: produtoId || ''
    })
    setBusca('')
  }

  const exportarRelatorio = () => {
    // Implementar exportação em PDF/Excel
    alert('Funcionalidade de exportação será implementada em breve!')
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="busca"
                  placeholder="Produto, motivo, documento..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={filtros.tipo} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {tiposMovimentacao.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      <div className="flex items-center space-x-2">
                        <tipo.icon className={`h-4 w-4 ${tipo.color}`} />
                        <span>{tipo.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="dataInicio"
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="dataFim"
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
            <Button onClick={exportarRelatorio} className="bg-gradient-primary">
              <FileText className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Histórico de Movimentações</span>
            </div>
            <Badge variant="outline">
              {movimentacoesFiltradas.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando movimentações...</p>
            </div>
          ) : movimentacoesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma movimentação encontrada</h3>
              <p className="text-muted-foreground">
                {busca || filtros.tipo || filtros.dataInicio || filtros.dataFim
                  ? 'Tente ajustar os filtros de busca'
                  : 'Nenhuma movimentação foi registrada ainda'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2">Quantidade</th>
                    <th className="text-left p-2">Estoque Anterior</th>
                    <th className="text-left p-2">Estoque Posterior</th>
                    <th className="text-left p-2">Valor Unit.</th>
                    <th className="text-left p-2">Valor Total</th>
                    <th className="text-left p-2">Motivo</th>
                    <th className="text-left p-2">Documento</th>
                    <th className="text-left p-2">Usuário</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoesFiltradas.map((mov) => {
                    const tipoInfo = getTipoInfo(mov.tipo)
                    const IconeTipo = tipoInfo.icon
                    
                    return (
                      <tr key={mov.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          {mov.data_movimentacao 
                            ? format(new Date(mov.data_movimentacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                            : '-'
                          }
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <IconeTipo className={`h-4 w-4 ${tipoInfo.color}`} />
                            <span className="font-medium">{tipoInfo.label}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{mov.produto_nome}</p>
                            <p className="text-sm text-muted-foreground">
                              Código não informado
                            </p>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant={mov.tipo === 'entrada' ? 'default' : mov.tipo === 'saida' ? 'destructive' : 'secondary'}>
                            {mov.tipo === 'entrada' ? '+' : mov.tipo === 'saida' ? '-' : '='} {mov.quantidade}
                          </Badge>
                        </td>
                        <td className="p-2">{mov.quantidade_anterior}</td>
                        <td className="p-2">
                          <span className="font-medium">{mov.quantidade_posterior}</span>
                        </td>
                        <td className="p-2">
                          {mov.valor_unitario ? `R$ ${mov.valor_unitario.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-2">
                          {mov.valor_total ? `R$ ${mov.valor_total.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-2">
                          <span className="text-sm">{mov.motivo}</span>
                        </td>
                        <td className="p-2">
                          {mov.documento_numero ? (
                            <Badge variant="outline">{mov.documento_numero}</Badge>
                          ) : '-'}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{mov.usuario_nome}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

