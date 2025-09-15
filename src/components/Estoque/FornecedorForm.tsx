import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Truck, Phone, Mail, MapPin, User } from 'lucide-react'

interface FornecedorFormProps {
  fornecedor?: any
  onSave: (dados: any) => void
  onCancel: () => void
}

export const FornecedorForm: React.FC<FornecedorFormProps> = ({
  fornecedor,
  onSave,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      nome: fornecedor?.nome || '',
      cnpj_cpf: fornecedor?.cnpj_cpf || '',
      telefone: fornecedor?.contato?.telefone || '',
      email: fornecedor?.contato?.email || '',
      endereco: fornecedor?.contato?.endereco || '',
      pessoa_contato: fornecedor?.contato?.pessoa_contato || '',
      observacoes: fornecedor?.observacoes || ''
    }
  })

  const onSubmit = (data: any) => {
    const dadosFornecedor = {
      nome: data.nome,
      cnpj_cpf: data.cnpj_cpf,
      contato: {
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        pessoa_contato: data.pessoa_contato
      },
      observacoes: data.observacoes
    }
    onSave(dadosFornecedor)
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="h-5 w-5" />
          <span>{fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basico">Dados Básicos</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
            </TabsList>

            {/* Aba Dados Básicos */}
            <TabsContent value="basico" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Fornecedor *</Label>
                <Input
                  id="nome"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  placeholder="Ex: Auto Peças Silva Ltda"
                />
                {errors.nome && (
                  <span className="text-sm text-red-500">
                    {typeof errors.nome.message === 'string' ? errors.nome.message : 'Campo obrigatório'}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
                <Input
                  id="cnpj_cpf"
                  {...register('cnpj_cpf')}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  {...register('observacoes')}
                  placeholder="Observações sobre o fornecedor..."
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Aba Contato */}
            <TabsContent value="contato" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="telefone"
                      {...register('telefone')}
                      className="pl-10"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="pl-10"
                      placeholder="contato@fornecedor.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pessoa_contato">Pessoa de Contato</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="pessoa_contato"
                    {...register('pessoa_contato')}
                    className="pl-10"
                    placeholder="Nome da pessoa responsável"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                  <Textarea
                    id="endereco"
                    {...register('endereco')}
                    className="pl-10"
                    placeholder="Endereço completo do fornecedor..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {fornecedor ? 'Atualizar' : 'Criar'} Fornecedor
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}