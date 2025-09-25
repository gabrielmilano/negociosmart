import { useState, useEffect } from 'react'
import { ArrowLeft, RotateCcw, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { usePedidos } from '@/contexts/PedidosContext'
import type { ProdutoComStatus, HistoricoStatus, StatusPedido } from '@/types/pedidos'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface HistoricoPedidoProps {
  produto: ProdutoComStatus
  onVoltar: () => void
}

export function HistoricoPedido({ produto, onVoltar }: HistoricoPedidoProps) {
  const [historico, setHistorico] = useState<HistoricoStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [observacoes, setObservacoes] = useState('')
  const { buscarHistoricoPedido, atualizarStatusPedido } = usePedidos()

  useEffect(() => {
    loadHistorico()
  }, [produto.id])

  const loadHistorico = async () => {
    setLoading(true)
    const data = await buscarHistoricoPedido(produto.id)
    setHistorico(data)
    setLoading(false)
  }

  const getStatusBadge = (status: StatusPedido) => {
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

  const handleStatusChange = async (novoStatus: StatusPedido) => {
    await atualizarStatusPedido(produto.id, novoStatus, observacoes)
    setObservacoes('')
    await loadHistorico()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onVoltar}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">Histórico do Pedido</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{produto.nome}</h3>
              {produto.codigo_interno && (
                <p className="text-sm text-muted-foreground">
                  Código: {produto.codigo_interno}
                </p>
              )}
            </div>
            {getStatusBadge(produto.status_pedido as StatusPedido)}
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
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MessageSquare className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Adicionar observações..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleStatusChange('PENDENTE')}
            disabled={produto.status_pedido === 'PENDENTE'}
          >
            Marcar Pendente
          </Button>
          <Button
            variant="outline"
            onClick={() => handleStatusChange('ENVIADO_N8N')}
            disabled={produto.status_pedido === 'ENVIADO_N8N'}
          >
            Marcar Enviado
          </Button>
          <Button
            onClick={() => handleStatusChange('RESOLVIDO')}
            disabled={produto.status_pedido === 'RESOLVIDO'}
          >
            Marcar Resolvido
          </Button>
        </div>
      </div>

      {/* Lista de Histórico */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
        </div>
      ) : historico.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum histórico encontrado</h3>
          <p className="text-muted-foreground">
            Este pedido ainda não possui registros no histórico.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {historico.map((registro) => (
            <Card key={registro.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(registro.status)}
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(registro.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    {registro.observacoes && (
                      <p className="mt-2 text-sm">{registro.observacoes}</p>
                    )}
                  </div>
                  <div className="text-sm text-right">
                    <p className="font-medium">{registro.usuario?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={loadHistorico}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Atualizar Histórico
        </Button>
      </div>
    </div>
  )
}