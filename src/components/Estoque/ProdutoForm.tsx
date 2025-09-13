import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Camera, Package, DollarSign, MapPin, Calendar, Image } from 'lucide-react'
import { BarcodeScanner } from './BarcodeScanner'
import { useEstoque } from '@/hooks/useEstoque'

interface ProdutoFormProps {
  produto?: any
  onSave: (dados: any) => void
  onCancel: () => void
}

export const ProdutoForm: React.FC<ProdutoFormProps> = ({
  produto,
  onSave,
  onCancel
}) => {
  const [showScanner, setShowScanner] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const { categorias, fornecedores } = useEstoque()
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      codigo_interno: produto?.codigo_interno || '',
      codigo_barras: produto?.codigo_barras || '',
      nome: produto?.nome || '',
      descricao: produto?.descricao || '',
      categoria_id: produto?.categoria_id || '',
      fornecedor_id: produto?.fornecedor_id || '',
      preco_custo: produto?.preco_custo || 0,
      preco_venda: produto?.preco_venda || 0,
      margem_lucro: produto?.margem_lucro || 0,
      estoque_atual: produto?.estoque_atual || 0,
      estoque_minimo: produto?.estoque_minimo || 0,
      estoque_maximo: produto?.estoque_maximo || 0,
      unidade_medida: produto?.unidade_medida || 'UN',
      localizacao: {
        setor: produto?.localizacao?.setor || '',
        prateleira: produto?.localizacao?.prateleira || '',
        posicao: produto?.localizacao?.posicao || ''
      },
      peso: produto?.peso || 0,
      dimensoes: {
        altura: produto?.dimensoes?.altura || 0,
        largura: produto?.dimensoes?.largura || 0,
        profundidade: produto?.dimensoes?.profundidade || 0
      },
      data_validade: produto?.data_validade || '',
      observacoes: produto?.observacoes || ''
    }
  })

  const precoCusto = watch('preco_custo')
  const precoVenda = watch('preco_venda')

  // Calcular margem automaticamente
  useEffect(() => {
    if (precoCusto > 0 && precoVenda > 0) {
      const margem = ((precoVenda - precoCusto) / precoCusto) * 100
      setValue('margem_lucro', Math.round(margem * 100) / 100)
    }
  }, [precoCusto, precoVenda, setValue])

  const handleBarcodeScanned = (codigo: string) => {
    setValue('codigo_barras', codigo)
    setShowScanner(false)
  }

  const onSubmit = (data: any) => {
    onSave(data)
  }

  const unidadesMedida = [
    { value: 'UN', label: 'Unidade' },
    { value: 'KG', label: 'Quilograma' },
    { value: 'G', label: 'Grama' },
    { value: 'L', label: 'Litro' },
    { value: 'ML', label: 'Mililitro' },
    { value: 'M', label: 'Metro' },
    { value: 'CM', label: 'Centímetro' },
    { value: 'M²', label: 'Metro Quadrado' },
    { value: 'M³', label: 'Metro Cúbico' },
    { value: 'CX', label: 'Caixa' },
    { value: 'PC', label: 'Peça' },
    { value: 'PAR', label: 'Par' },
    { value: 'JG', label: 'Jogo' }
  ]

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>{produto ? 'Editar Produto' : 'Novo Produto'}</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basico" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basico">Básico</TabsTrigger>
                <TabsTrigger value="precos">Preços</TabsTrigger>
                <TabsTrigger value="estoque">Estoque</TabsTrigger>
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              </TabsList>

              {/* Aba Básico */}
              <TabsContent value="basico" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo_interno">Código Interno *</Label>
                    <Input
                      id="codigo_interno"
                      {...register('codigo_interno', { required: 'Código interno é obrigatório' })}
                      placeholder="Ex: PROD001"
                    />
                    {errors.codigo_interno && (
                      <span className="text-sm text-red-500">{errors.codigo_interno.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigo_barras">Código de Barras</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="codigo_barras"
                        {...register('codigo_barras')}
                        placeholder="Ex: 7891234567890"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowScanner(true)}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    {...register('nome', { required: 'Nome é obrigatório' })}
                    placeholder="Ex: Filtro de Óleo Automotivo"
                  />
                  {errors.nome && (
                    <span className="text-sm text-red-500">{errors.nome.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    {...register('descricao')}
                    placeholder="Descrição detalhada do produto..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria_id">Categoria</Label>
                    <Select onValueChange={(value) => setValue('categoria_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            <div className="flex items-center space-x-2">
                              <span>{categoria.icone}</span>
                              <span>{categoria.nome}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fornecedor_id">Fornecedor</Label>
                    <Select onValueChange={(value) => setValue('fornecedor_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id}>
                            {fornecedor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Aba Preços */}
              <TabsContent value="precos" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco_custo">Preço de Custo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="preco_custo"
                        type="number"
                        step="0.01"
                        {...register('preco_custo', { valueAsNumber: true })}
                        className="pl-10"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco_venda">Preço de Venda</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="preco_venda"
                        type="number"
                        step="0.01"
                        {...register('preco_venda', { valueAsNumber: true })}
                        className="pl-10"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="margem_lucro">Margem de Lucro (%)</Label>
                    <div className="relative">
                      <Input
                        id="margem_lucro"
                        type="number"
                        step="0.01"
                        {...register('margem_lucro', { valueAsNumber: true })}
                        placeholder="0,00"
                        readOnly
                        className="bg-muted"
                      />
                      <Badge className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        Auto
                      </Badge>
                    </div>
                  </div>
                </div>

                {precoCusto > 0 && precoVenda > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Resumo Financeiro</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Custo:</span>
                        <p className="font-medium">R$ {precoCusto.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Venda:</span>
                        <p className="font-medium">R$ {precoVenda.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lucro:</span>
                        <p className="font-medium text-green-600">
                          R$ {(precoVenda - precoCusto).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Aba Estoque */}
              <TabsContent value="estoque" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estoque_atual">Estoque Atual</Label>
                    <Input
                      id="estoque_atual"
                      type="number"
                      {...register('estoque_atual', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                    <Input
                      id="estoque_minimo"
                      type="number"
                      {...register('estoque_minimo', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estoque_maximo">Estoque Máximo</Label>
                    <Input
                      id="estoque_maximo"
                      type="number"
                      {...register('estoque_maximo', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unidade_medida">Unidade</Label>
                    <Select onValueChange={(value) => setValue('unidade_medida', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="UN" />
                      </SelectTrigger>
                      <SelectContent>
                        {unidadesMedida.map((unidade) => (
                          <SelectItem key={unidade.value} value={unidade.value}>
                            {unidade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Localização */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <Label>Localização Física</Label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="setor">Setor</Label>
                      <Input
                        id="setor"
                        {...register('localizacao.setor')}
                        placeholder="Ex: A"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prateleira">Prateleira</Label>
                      <Input
                        id="prateleira"
                        {...register('localizacao.prateleira')}
                        placeholder="Ex: 01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="posicao">Posição</Label>
                      <Input
                        id="posicao"
                        {...register('localizacao.posicao')}
                        placeholder="Ex: 03"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Aba Detalhes */}
              <TabsContent value="detalhes" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.001"
                      {...register('peso', { valueAsNumber: true })}
                      placeholder="0,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="altura">Altura (cm)</Label>
                    <Input
                      id="altura"
                      type="number"
                      step="0.1"
                      {...register('dimensoes.altura', { valueAsNumber: true })}
                      placeholder="0,0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="largura">Largura (cm)</Label>
                    <Input
                      id="largura"
                      type="number"
                      step="0.1"
                      {...register('dimensoes.largura', { valueAsNumber: true })}
                      placeholder="0,0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profundidade">Profundidade (cm)</Label>
                    <Input
                      id="profundidade"
                      type="number"
                      step="0.1"
                      {...register('dimensoes.profundidade', { valueAsNumber: true })}
                      placeholder="0,0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_validade">Data de Validade</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="data_validade"
                      type="date"
                      {...register('data_validade')}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    {...register('observacoes')}
                    placeholder="Observações adicionais sobre o produto..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                {produto ? 'Atualizar' : 'Criar'} Produto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Scanner de Código de Barras */}
      <BarcodeScanner
        isOpen={showScanner}
        onScanSuccess={handleBarcodeScanned}
        onClose={() => setShowScanner(false)}
      />
    </>
  )
}