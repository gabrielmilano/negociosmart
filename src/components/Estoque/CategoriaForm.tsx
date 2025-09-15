import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag, X } from 'lucide-react'

interface CategoriaFormProps {
  categoria?: any
  onSave: (dados: any) => void
  onCancel: () => void
}

const icones = [
  '📦', '🔧', '⚙️', '🔩', '🛠️', '🚗', '🏠', '💡', '🔌', '🧰',
  '📱', '💻', '🖥️', '⌚', '🎮', '📺', '📷', '🎧', '🔋', '💾'
]

const cores = [
  '#6B7280', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#84CC16'
]

export const CategoriaForm: React.FC<CategoriaFormProps> = ({
  categoria,
  onSave,
  onCancel
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      nome: categoria?.nome || '',
      descricao: categoria?.descricao || '',
      icone: categoria?.icone || '📦',
      cor: categoria?.cor || '#6B7280'
    }
  })

  const iconeAtual = watch('icone')
  const corAtual = watch('cor')

  const onSubmit = (data: any) => {
    onSave(data)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Tag className="h-5 w-5" />
          <span>{categoria ? 'Editar Categoria' : 'Nova Categoria'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Categoria *</Label>
            <Input
              id="nome"
              {...register('nome', { required: 'Nome é obrigatório' })}
              placeholder="Ex: Peças Automotivas"
            />
            {errors.nome && (
              <span className="text-sm text-red-500">
                {typeof errors.nome.message === 'string' ? errors.nome.message : 'Campo obrigatório'}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descrição da categoria..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Ícone</Label>
            <div className="grid grid-cols-10 gap-2">
              {icones.map((icone) => (
                <button
                  key={icone}
                  type="button"
                  onClick={() => setValue('icone', icone)}
                  className={`p-2 text-xl border rounded-lg hover:bg-accent transition-colors ${
                    iconeAtual === icone ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                >
                  {icone}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Cor</Label>
            <div className="grid grid-cols-10 gap-2">
              {cores.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setValue('cor', cor)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    corAtual === cor ? 'border-gray-800 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-sm text-muted-foreground">Preview:</Label>
            <div className="flex items-center space-x-2 mt-2">
              <span style={{ color: corAtual }}>{iconeAtual}</span>
              <span className="font-medium">{watch('nome') || 'Nome da categoria'}</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {categoria ? 'Atualizar' : 'Criar'} Categoria
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}