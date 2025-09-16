import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ClipboardList, 
  Plus, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Save,
  X,
  Calculator,
  Package,
  Table
} from 'lucide-react'
import { useEstoque } from '@/hooks/useEstoque'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const InventarioFisico: React.FC = () => {
  const { 
    inventarios, 
    inventarioItens, 
    produtos, 
    categorias,
    loading,
    fetchInventarios,
    fetchInventarioItens,
    criarInventario,
    atualizarInventario,
    finalizarInventario,
    atualizarItemInventario,
    aplicarInventario
  } = useEstoque()

  const [showCriarInventario, setShowCriarInventario] = useState(false)
  const [inventarioSelecionado, setInventarioSelecionado] = useState<any>(null)
  const [editandoItem, setEditandoItem] = useState<string | null>(null)
  const [quantidadeEditando, setQuantidadeEditando] = useState<number>(0)
  const [observacoesEditando, setObservacoesEditando] = useState('')

  const [novoInventario, setNovoInventario] = useState({
    nome: '',
    descricao: '',
    categoria_ids: [] as string[],
    observacoes: ''
  })

  useEffect(() => {
    if (inventarioSelecionado) {
      fetchInventarioItens(inventarioSelecionado.id)
    }
  }, [inventarioSelecionado, fetchInventarioItens])

  const handleCriarInventario = async () => {
    if (!novoInventario.nome.trim()) {
      alert('Nome do inventário é obrigatório')
      return
    }

    const inventario = await criarInventario(novoInventario)
    if (inventario) {
      setNovoInventario({
        nome: '',
        descricao: '',
        categoria_ids: [],
        observacoes: ''
      })
      setShowCriarInventario(false)
      
      // Criar itens do inventário baseado nos produtos filtrados
      if (novoInventario.categoria_ids.length > 0) {
        // TODO: Implementar criação automática de itens baseado nas categorias
        console.log('Criar itens para categorias:', novoInventario.categoria_ids)
      }
    }
  }

  const handleIniciarInventario = async (inventarioId: string) => {
    await atualizarInventario(inventarioId, { 
      status: 'em_andamento',
      data_inicio: new Date().toISOString()
    })
  }

  const handleFinalizarInventario = async (inventarioId: string) => {
    await finalizarInventario(inventarioId)
  }

  const handleAplicarInventario = async (inventarioId: string) => {
    const confirmar = confirm('Tem certeza que deseja aplicar as diferenças do inventário? Esta ação não pode ser desfeita.')
    if (confirmar) {
      await aplicarInventario(inventarioId)
    }
  }

  const iniciarEdicaoItem = (item: any) => {
    setEditandoItem(item.id)
    setQuantidadeEditando(item.quantidade_contada || 0)
    setObservacoesEditando(item.observacoes || '')
  }

  const salvarEdicaoItem = async () => {
    if (editandoItem) {
      await atualizarItemInventario(editandoItem, quantidadeEditando, observacoesEditando)
      setEditandoItem(null)
      setQuantidadeEditando(0)
      setObservacoesEditando('')
      
      // Recarregar itens
      if (inventarioSelecionado) {
        fetchInventarioItens(inventarioSelecionado.id)
      }
    }
  }

  const cancelarEdicaoItem = () => {
    setEditandoItem(null)
    setQuantidadeEditando(0)
    setObservacoesEditando('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planejado':
        return <Badge variant="secondary">Planejado</Badge>
      case 'em_andamento':
        return <Badge variant="default">Em Andamento</Badge>
      case 'finalizado':
        return <Badge variant="outline">Finalizado</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getDiferencaBadge = (diferenca: number) => {
    if (diferenca === 0) {
      return <Badge variant="outline">OK</Badge>
    } else if (diferenca > 0) {
      return <Badge className="bg-green-100 text-green-800">+{diferenca}</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">{diferenca}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Inventário Físico</h2>
          <p className="text-muted-foreground">
            Controle e reconciliação de estoque físico
          </p>
        </div>
        
        <Dialog open={showCriarInventario} onOpenChange={setShowCriarInventario}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Novo Inventário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Inventário</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Inventário *</Label>
                <Input
                  id="nome"
                  value={novoInventario.nome}
                  onChange={(e) => setNovoInventario(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Inventário Mensal - Janeiro 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novoInventario.descricao}
                  onChange={(e) => setNovoInventario(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do inventário..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Categorias (Opcional)</Label>
                <Select 
                  value={novoInventario.categoria_ids[0] || ''} 
                  onValueChange={(value) => setNovoInventario(prev => ({ 
                    ...prev, 
                    categoria_ids: value ? [value] : [] 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.icone} {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={novoInventario.observacoes}
                  onChange={(e) => setNovoInventario(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCriarInventario(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCriarInventario}>
                  Criar Inventário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Inventários */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <span>Inventários</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : inventarios.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum inventário encontrado
                </p>
              ) : (
                <div className="space-y-2">
                  {inventarios.map((inventario) => (
                    <div
                      key={inventario.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        inventarioSelecionado?.id === inventario.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setInventarioSelecionado(inventario)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{inventario.nome}</h4>
                        {getStatusBadge(inventario.status || 'planejado')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {inventario.criado_em && format(new Date(inventario.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Inventário Selecionado */}
        <div className="lg:col-span-2">
          {inventarioSelecionado ? (
            <div className="space-y-4">
              {/* Cabeçalho do Inventário */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{inventarioSelecionado.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {inventarioSelecionado.descricao}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {inventarioSelecionado.status === 'planejado' && (
                        <Button
                          size="sm"
                          onClick={() => handleIniciarInventario(inventarioSelecionado.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Iniciar
                        </Button>
                      )}
                      {inventarioSelecionado.status === 'em_andamento' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFinalizarInventario(inventarioSelecionado.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Finalizar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAplicarInventario(inventarioSelecionado.id)}
                          >
                            <Calculator className="mr-2 h-4 w-4" />
                            Aplicar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Itens do Inventário */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Itens do Inventário</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {inventarioItens.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum item encontrado neste inventário
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Produto</th>
                            <th className="text-left p-2">Estoque Sistema</th>
                            <th className="text-left p-2">Contado</th>
                            <th className="text-left p-2">Diferença</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventarioItens.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="p-2">
                                <div>
                                  <p className="font-medium">{item.produto_nome}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.produto_codigo}
                                  </p>
                                </div>
                              </td>
                              <td className="p-2">
                                <span className="font-medium">
                                  {item.quantidade_sistema} {item.produtos?.unidade_medida || 'UN'}
                                </span>
                              </td>
                              <td className="p-2">
                                {editandoItem === item.id ? (
                                  <Input
                                    type="number"
                                    value={quantidadeEditando}
                                    onChange={(e) => setQuantidadeEditando(Number(e.target.value))}
                                    className="w-20"
                                  />
                                ) : (
                                  <span className="font-medium">
                                    {item.quantidade_contada || '-'} {item.produtos?.unidade_medida || 'UN'}
                                  </span>
                                )}
                              </td>
                              <td className="p-2">
                                {getDiferencaBadge(item.diferenca || 0)}
                              </td>
                              <td className="p-2">
                                {item.quantidade_contada !== null ? (
                                  <Badge variant="outline">Contado</Badge>
                                ) : (
                                  <Badge variant="secondary">Pendente</Badge>
                                )}
                              </td>
                              <td className="p-2">
                                {editandoItem === item.id ? (
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      onClick={salvarEdicaoItem}
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={cancelarEdicaoItem}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => iniciarEdicaoItem(item)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione um Inventário</h3>
                <p className="text-muted-foreground">
                  Escolha um inventário da lista para visualizar e editar os itens
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

