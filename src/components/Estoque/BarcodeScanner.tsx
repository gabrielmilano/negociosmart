import React, { useEffect, useRef, useState } from 'react'
import { Camera, X, Flashlight, FlashlightOff, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [error, setError] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      initializeCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const initializeCamera = async () => {
    try {
      setError('')
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmera traseira
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)
        
        // Iniciar detecção quando o vídeo estiver pronto
        videoRef.current.onloadedmetadata = () => {
          startDetection()
        }
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err)
      setError('Erro ao acessar a câmera. Verifique as permissões.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const startDetection = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    const detectBarcode = () => {
      if (!isScanning || !video.videoWidth || !video.videoHeight) {
        if (isScanning) {
          requestAnimationFrame(detectBarcode)
        }
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      // Aqui você integraria com uma biblioteca de detecção de código de barras
      // Por simplicidade, vamos simular a detecção
      
      requestAnimationFrame(detectBarcode)
    }

    detectBarcode()
  }

  const toggleFlashlight = async () => {
    if (!stream) return

    try {
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      
      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn } as any]
        })
        setFlashlightOn(!flashlightOn)
      }
    } catch (err) {
      console.error('Erro ao controlar flash:', err)
    }
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
      <Card className="w-full max-w-md bg-white">
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
              <Button onClick={initializeCamera} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Overlay de mira */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-32 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      Posicione o código aqui
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFlashlight}
                  className="flex items-center space-x-2"
                >
                  {flashlightOn ? (
                    <FlashlightOff className="h-4 w-4" />
                  ) : (
                    <Flashlight className="h-4 w-4" />
                  )}
                  <span>Flash</span>
                </Button>
                
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
                <p>📱 Aponte a câmera para o código de barras</p>
                <p>⌨️ Use leitor de código ou digite manualmente</p>
                <p className="text-xs">💡 Leitores USB detectados automaticamente</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}