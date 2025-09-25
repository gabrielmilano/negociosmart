import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useEstoque } from '@/hooks/useEstoque'
import { AlertTriangle, Package } from 'lucide-react'

interface ProdutoCritico {
  id: string
  nome: string
  codigo_interno: string
  categoria_nome: string
  estoque_atual: number
  estoque_minimo: number
  status_pedido: string | null
}

export const PainelFornecedor: React.FC = () => {
  const { produtos } = useEstoque()
  const [produtosCriticos, setProdutosCriticos] = useState<ProdutoCritico[]>([])

  useEffect(() => {
    // Filtrar produtos com estoque abaixo do mínimo
    const produtosAbaixoMinimo = produtos
      .filter(p => 
        p.estoque_atual != null && 
        p.estoque_minimo != null && 
        p.estoque_atual < p.estoque_minimo
      )
      .map(p => ({
        id: p.id,
        nome: p.nome || '',
        codigo_interno: p.codigo_interno || '',
        categoria_nome: p.categoria_nome || '',
        estoque_atual: p.estoque_atual || 0,
        estoque_minimo: p.estoque_minimo || 0,
        status_pedido: 'PENDENTE' // Por enquanto, sempre PENDENTE
      }))
      .sort((a, b) => (
        // Ordenar por maior diferença entre estoque atual e mínimo
        (b.estoque_minimo - b.estoque_atual) - (a.estoque_minimo - a.estoque_atual)
      ))

    setProdutosCriticos(produtosAbaixoMinimo)
  }, [produtos])

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{produtosCriticos.length}</h3>
              <p className="text-muted-foreground">Produtos Críticos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Produtos com Estoque Crítico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosCriticos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-mono">{produto.codigo_interno}</TableCell>
                  <TableCell>{produto.nome}</TableCell>
                  <TableCell>{produto.categoria_nome}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">CRÍTICO</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {produtosCriticos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum produto crítico encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}