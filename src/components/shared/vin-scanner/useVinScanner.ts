
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'
import { createWorker } from 'tesseract.js'

export type ScanMode = 'barcode' | 'ocr'

export function useVinScanner({ onScan }: { onScan: (vin: string) => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [scanMode, setScanMode] = useState<ScanMode>('barcode')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const workerRef = useRef<any>(null)
  const isScanning = useRef(false)

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/png', 1.0)
  }

  const startOCRScanning = async () => {
    if (!isCameraActive || !workerRef.current || !isScanning.current) return

    try {
      const frameData = captureFrame()
      if (!frameData) {
        if (isScanning.current) {
          requestAnimationFrame(startOCRScanning)
        }
        return
      }

      const img = new Image()
      img.src = frameData

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const { data: { text } } = await workerRef.current.recognize(img)
      console.log('OCR Text:', text)
      
      const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/i)
      
      if (vinMatch) {
        const scannedValue = vinMatch[0]
        if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(scannedValue)) {
          onScan(scannedValue.toUpperCase())
          toast.success("VIN scanned successfully")
          handleClose()
          return
        }
      }
      
      if (isScanning.current) {
        requestAnimationFrame(startOCRScanning)
      }
    } catch (error) {
      console.error('OCR error:', error)
      if (isScanning.current) {
        requestAnimationFrame(startOCRScanning)
      }
    }
  }

  const startScanning = async () => {
    if (!videoRef.current || !readerRef.current || !isCameraActive || !isScanning.current) return

    try {
      const result = await readerRef.current.decodeFromVideoElement(videoRef.current)
      if (result) {
        const scannedValue = result.getText().trim()
        
        if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(scannedValue)) {
          onScan(scannedValue.toUpperCase())
          toast.success("VIN scanned successfully")
          handleClose()
        } else {
          console.log("Invalid VIN format:", scannedValue)
          if (isScanning.current) {
            requestAnimationFrame(() => startScanning())
          }
        }
      } else {
        if (isScanning.current) {
          requestAnimationFrame(() => startScanning())
        }
      }
    } catch (error) {
      if (isScanning.current) {
        requestAnimationFrame(() => startScanning())
      }
    }
  }

  const stopCamera = () => {
    isScanning.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (readerRef.current) {
      readerRef.current.reset()
      readerRef.current = null
    }
    setIsCameraActive(false)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        await videoRef.current.play()
        
        if (scanMode === 'barcode') {
          const hints = new Map<DecodeHintType, any>();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.CODE_39,
            BarcodeFormat.CODE_128,
            BarcodeFormat.DATA_MATRIX
          ]);
          hints.set(DecodeHintType.TRY_HARDER, true);
          
          readerRef.current = new BrowserMultiFormatReader(hints)
          isScanning.current = true
          startScanning()
        } else {
          workerRef.current = await createWorker('eng')
          isScanning.current = true
          startOCRScanning()
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Could not access camera. Please check camera permissions.")
      setIsDialogOpen(false)
    }
  }

  const handleClose = async () => {
    isScanning.current = false
    stopCamera()
    if (workerRef.current) {
      await workerRef.current.terminate()
      workerRef.current = null
    }
    setIsDialogOpen(false)
  }

  const handleOpen = async () => {
    setIsDialogOpen(true)
    await startCamera()
  }

  const toggleScanMode = async () => {
    isScanning.current = false
    stopCamera()
    setScanMode(prev => prev === 'barcode' ? 'ocr' : 'barcode')
    await startCamera()
  }

  useEffect(() => {
    return () => {
      handleClose()
    }
  }, [])

  return {
    isDialogOpen,
    scanMode,
    videoRef,
    canvasRef,
    handleClose,
    handleOpen,
    toggleScanMode
  }
}
