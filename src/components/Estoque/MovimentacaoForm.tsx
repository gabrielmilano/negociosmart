import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, RotateCcw, Package, DollarSign, FileText } from 'lucide-react'
import { useEstoque } from '@/hooks/useEstoque'

interface MovimentacaoFormProps {
  produto?: any
  onSave: (dados: any) => void
  onCancel: () => void
}

export const MovimentacaoForm: React.FC<MovimentacaoFormProps> = ({
  produto,
  onSave,
  onCancel
}) => {
  const [tipoSelecionado, setTipoSelecionado] = useState<'entrada' | 'saida' | 'ajuste'>('entrada')
  const { buscarProdutoPorCodigo } = useEstoque()
  const [produtoSelecionado, setProdutoSelecionado] = useState(produto)

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      produto_id: produto?.id || '',
      codigo_busca: produto?.codigo_interno || produto?.codigo_barras || '',
      tipo: 'entrada',
      quantidade: 1,
      valor_unitario: produto?.preco_custo || 0,
      motivo: '',
      observacoes: '',
      documento_numero: '',
      fornecedor_cliente: ''
    }
  })

  const quantidade = watch('quantidade')
  const valorUnitario = watch('valor_unitario')
  const codigoBusca = watch('codigo_busca')

  const tiposMovimentacao = [
    {
      value: 'entrada',
      label: 'Entrada',
      icon: ArrowUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Adicionar produtos ao estoque'
    },
    {
      value: 'saida',
      label: 'Saída',
      icon: ArrowDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Remover produtos do estoque'
    },
    {
      value: 'ajuste',
      label: 'Ajuste',
      icon: RotateCcw,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Corrigir quantidade no estoque'
    }
  ]

  const motivosComuns = {
    entrada: [
      'Compra de mercadoria',
      'Devolução de cliente',
      'Transferência entre filiais',
      'Produção interna',
      'Ajuste de inventário',
      'Outros'
    ],
    saida: [
      'Venda ao cliente',
      'Devolução ao fornecedor',
      'Transferência entre filiais',
      'Perda/Quebra',
      'Uso interno',
      'Amostra grátis',
      'Outros'
    ],
    ajuste: [
      'Inventário físico',
      'Correção de erro',
      'Produto vencido',
      'Produto danificado',
      'Outros'
    ]
  }

  // Buscar produto por código
  const buscarProduto = async () => {
    if (!codigoBusca) return

    const produtoEncontrado = await buscarProdutoPorCodigo(codigoBusca)
    if (produtoEncontrado) {
      setProdutoSelecionado(produtoEncontrado)
      setValue('produto_id', produtoEncontrado.id ?? '')
      setValue('valor_unitario', produtoEncontrado.preco_custo ?? 0)
    } else {
      setProdutoSelecionado(null)
      setValue('produto_id', '')
    }
  }

  useEffect(() => {
    if (codigoBusca && codigoBusca.length >= 3) {
      const timeoutId = setTimeout(buscarProduto, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [codigoBusca])

  const onSubmit = (data: any) => {
    if (!produtoSelecionado) {
      alert('Selecione um produto válido')
      return
    }

    const quantidade = Number(data.quantidade)
    const valorUnitario = Number(data.valor_unitario)

    // Validações adicionais
    if (quantidade <= 0) {
      alert('Quantidade deve ser maior que zero')
      return
    }

    if (quantidade > 999999) {
      alert('Quantidade muito alta. Máximo permitido: 999.999')
      return
    }

    if (valorUnitario < 0) {
      alert('Valor unitário não pode ser negativo')
      return
    }

    if (valorUnitario > 999999.99) {
      alert('Valor unitário muito alto. Máximo permitido: R$ 999.999,99')
      return
    }

    // Validação específica para saídas
    if (tipoSelecionado === 'saida' && quantidade > (produtoSelecionado.estoque_atual || 0)) {
      alert(`Estoque insuficiente! Disponível: ${produtoSelecionado.estoque_atual || 0}`)
      return
    }

    const dadosMovimentacao = {
      produto_id: produtoSelecionado.id,
      tipo: tipoSelecionado,
      quantidade: quantidade,
      valor_unitario: valorUnitario > 0 ? valorUnitario : undefined,
      motivo: data.motivo,
      observacoes: data.observacoes,
      documento_numero: data.documento_numero,
      fornecedor_cliente: data.fornecedor_cliente
    }

    onSave(dadosMovimentacao)
  }

  const tipoAtual = tiposMovimentacao.find(t => t.value === tipoSelecionado)
  const IconeTipo = tipoAtual?.icon || Package

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <IconeTipo className={`h-5 w-5 ${tipoAtual?.color}`} />
          <span>Nova Movimentação de Estoque</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seleção do Tipo de Movimentação */}
          <div className="space-y-3">
            <Label>Tipo de Movimentação</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tiposMovimentacao.map((tipo) => {
                const IconeTipoItem = tipo.icon
                return (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => {
                      setTipoSelecionado(tipo.value as any)
                      setValue('tipo', tipo.value)
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tipoSelecionado === tipo.value
                        ? `${tipo.borderColor} ${tipo.bgColor}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <IconeTipoItem className={`h-6 w-6 ${tipo.color}`} />
                      <span className="font-medium">{tipo.label}</span>
                      <span className="text-xs text-muted-foreground text-center">
                        {tipo.description}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Busca de Produto */}
          <div className="space-y-3">
            <Label htmlFor="codigo_busca">Buscar Produto</Label>
            <div className="space-y-2">
              <Input
                id="codigo_busca"
                {...register('codigo_busca', { required: 'Código do produto é obrigatório' })}
                placeholder="Digite o código interno ou código de barras"
                className="text-lg"
              />
              {errors.codigo_busca && (
                <span className="text-sm text-red-500">
                  {typeof errors.codigo_busca.message === 'string' ? errors.codigo_busca.message : 'Campo obrigatório'}
                </span>
              )}
            </div>

            {/* Produto Encontrado */}
            {produtoSelecionado && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-800">{produtoSelecionado.nome}</h4>
                    <p className="text-sm text-green-600">
                      Código: {produtoSelecionado.codigo_interno}
                      {produtoSelecionado.codigo_barras && ` | EAN: ${produtoSelecionado.codigo_barras}`}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline">
                        Estoque: {produtoSelecionado.estoque_atual} {produtoSelecionado.unidade_medida}
                      </Badge>
                      {produtoSelecionado.categoria_nome && (
                        <Badge variant="secondary">
                          {produtoSelecionado.categoria_nome}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {codigoBusca && !produtoSelecionado && codigoBusca.length >= 3 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Produto não encontrado</p>
              </div>
            )}
          </div>

          {/* Detalhes da Movimentação */}
          {produtoSelecionado && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    {...register('quantidade', { 
                      required: 'Quantidade é obrigatória',
                      min: { value: 1, message: 'Quantidade deve ser maior que 0' }
                    })}
                    placeholder="1"
                  />
                  {errors.quantidade && (
                    <span className="text-sm text-red-500">
                      {typeof errors.quantidade.message === 'string' ? errors.quantidade.message : 'Campo obrigatório'}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_unitario">Valor Unitário</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="valor_unitario"
                      type="number"
                      step="0.01"
                      {...register('valor_unitario', { valueAsNumber: true })}
                      className="pl-10"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro */}
              {quantidade > 0 && valorUnitario > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Valor Total:</span>
                    <span className="text-lg font-bold">
                      R$ {(quantidade * valorUnitario).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo *</Label>
                <Select onValueChange={(value) => setValue('motivo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivosComuns[tipoSelecionado].map((motivo) => (
                      <SelectItem key={motivo} value={motivo}>
                        {motivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documento_numero">Número do Documento</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="documento_numero"
                      {...register('documento_numero')}
                      className="pl-10"
                      placeholder="Ex: NF-001234"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fornecedor_cliente">
                    {tipoSelecionado === 'entrada' ? 'Fornecedor' : 'Cliente'}
                  </Label>
                  <Input
                    id="fornecedor_cliente"
                    {...register('fornecedor_cliente')}
                    placeholder={tipoSelecionado === 'entrada' ? 'Nome do fornecedor' : 'Nome do cliente'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  {...register('observacoes')}
                  placeholder="Observações adicionais sobre a movimentação..."
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!produtoSelecionado}
              className="bg-gradient-primary"
            >
              Registrar {tipoAtual?.label}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}