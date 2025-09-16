import React, { useEffect, useRef, useState } from 'react'
import { Camera, X, Flashlight, FlashlightOff, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'

interface BarcodeScannerProps {
  onScanSuccess: (codigo: string) => void
  onClose: () => void
  isOpen: boolean
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onClose,
  isOpen
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [scannedCodes, setScannedCodes] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      initializeScanner()
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isOpen])

  const initializeScanner = () => {
    try {
      setError('')
      setIsScanning(true)

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedFormats: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.QR_CODE
        ]
      }

      scannerRef.current = new Html5QrcodeScanner(
        "scanner-container",
        config,
        false
      )

      scannerRef.current.render(
        (decodedText) => {
          // Evitar leituras duplicadas
          if (!scannedCodes.includes(decodedText)) {
            setScannedCodes(prev => [...prev, decodedText])
            onScanSuccess(decodedText)
            stopScanner()
            onClose()
          }
        },
        (error) => {
          // Ignorar erros de leitura (normal durante a varredura)
          if (error && !error.includes('No MultiFormat Readers')) {
            console.debug('Erro de leitura:', error)
          }
        }
      )
    } catch (err) {
      console.error('Erro ao inicializar scanner:', err)
      setError('Erro ao inicializar o scanner. Verifique as permissões da câmera.')
      setIsScanning(false)
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  // Input manual para código de barras
  const handleManualInput = () => {
    const codigo = prompt('Digite o código de barras:')
    if (codigo && codigo.trim()) {
      onScanSuccess(codigo.trim())
      onClose()
    }
  }

  // Função para capturar entrada de teclado (máquinas de código de barras)
  useEffect(() => {
    if (!isOpen) return

    let inputBuffer = ''
    let lastInputTime = 0

    const handleKeyPress = (event: KeyboardEvent) => {
      const currentTime = Date.now()
      
      // Se passou mais de 100ms desde a última entrada, limpa o buffer
      if (currentTime - lastInputTime > 100) {
        inputBuffer = ''
      }
      
      lastInputTime = currentTime

      // Se for Enter, processa o código acumulado
      if (event.key === 'Enter') {
        if (inputBuffer.length >= 3) { // Códigos podem ter 3+ dígitos
          event.preventDefault()
          onScanSuccess(inputBuffer.trim())
          onClose()
          return
        }
        inputBuffer = ''
      } 
      // Se for um caractere válido, adiciona ao buffer
      else if (event.key.length === 1 && (
        event.key.match(/[0-9a-zA-Z]/) || 
        ['-', '_', '.', '/', '+', '*'].includes(event.key)
      )) {
        inputBuffer += event.key
      }
    }

    document.addEventListener('keypress', handleKeyPress)
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress)
    }
  }, [isOpen, onScanSuccess, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <ScanLine className="h-5 w-5" />
            <span>Scanner de Código</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center space-y-4">
              <div className="text-red-500 text-sm">{error}</div>
              <Button onClick={initializeScanner} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <>
              {/* Container do Scanner */}
              <div className="relative">
                <div 
                  id="scanner-container" 
                  className="w-full min-h-[300px] bg-black rounded-lg overflow-hidden"
                />
                
                {/* Overlay de instruções */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-black bg-opacity-70 text-white text-sm px-3 py-2 rounded-lg text-center">
                    📱 Aponte a câmera para o código de barras
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                {/* Botão para entrada manual */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualInput}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  ⌨️ Digitar Código
                </Button>
                
                {/* Botão para fechar e usar modo leitor */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                >
                  🔧 Usar Leitor USB
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>📱 Suporta códigos de barras EAN, UPC, Code 128, QR Code e mais</p>
                <p>⌨️ Use leitor de código USB ou digite manualmente</p>
                <p className="text-xs">💡 Leitores USB detectados automaticamente no modo leitor</p>
              </div>

              {/* Histórico de códigos escaneados */}
              {scannedCodes.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Códigos escaneados nesta sessão:</h4>
                  <div className="space-y-1">
                    {scannedCodes.slice(-3).map((code, index) => (
                      <div key={index} className="text-xs font-mono bg-white px-2 py-1 rounded border">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}