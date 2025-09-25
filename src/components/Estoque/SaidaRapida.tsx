import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useEstoque } from '@/hooks/useEstoque'
import { Scan } from 'lucide-react'
import { BarcodeScanner } from './BarcodeScanner'

export const SaidaRapida: React.FC = () => {
  const [codigo, setCodigo] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [showScanner, setShowScanner] = useState(false)
  const [processando, setProcessando] = useState(false)
  const { toast } = useToast()
  const { buscarProdutoPorCodigo, registrarMovimentacao } = useEstoque()

  // Função para limpar o formulário
  const limparForm = () => {
    setCodigo('')
    setQuantidade(1)
  }

  // Função para registrar saída
  const registrarSaida = async () => {
    if (!codigo || quantidade <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive"
      })
      return
    }

    setProcessando(true)
    try {
      const produto = await buscarProdutoPorCodigo(codigo)
      if (!produto) {
        toast({
          title: "Produto não encontrado",
          description: "Verifique o código e tente novamente.",
          variant: "destructive"
        })
        return
      }

      await registrarMovimentacao({
        produto_id: produto.id,
        tipo: 'saida',
        quantidade: quantidade,
        motivo: 'Saída rápida',
        observacoes: 'Registrado via Quick-Scan'
      })

      toast({
        title: "Saída registrada",
        description: `${quantidade}x ${produto.nome} registrado com sucesso.`
      })

      limparForm()
    } catch (error: any) {
      toast({
        title: "Erro ao registrar saída",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      })
    } finally {
      setProcessando(false)
    }
  }

  // Handler para quando um código de barras é lido
  const handleBarcodeScanned = (result: string) => {
    setCodigo(result)
    setShowScanner(false)
  }

  // Handler para tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      registrarSaida()
    }
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Quick-Scan: Saída Rápida
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowScanner(true)}
            >
              <Scan className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Código de barras"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-lg"
              autoComplete="off"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              onKeyPress={handleKeyPress}
              min={1}
              className="text-lg"
            />
          </div>
          <Button
            className="w-full"
            onClick={registrarSaida}
            disabled={processando || !codigo || quantidade <= 0}
          >
            Registrar Saída
          </Button>
        </CardContent>
      </Card>

      <BarcodeScanner
        isOpen={showScanner}
        onScanSuccess={handleBarcodeScanned}
        onClose={() => setShowScanner(false)}
      />
    </>
  )
}