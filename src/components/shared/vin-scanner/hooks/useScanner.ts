
import { useState, useRef, useEffect } from "react"
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'
import { createWorker } from 'tesseract.js'
import { toast } from "sonner"
import { validateVin } from "../utils/vinValidation"
import { captureFrame } from "../utils/imageProcessing"

interface UseScannerProps {
  onScan: (vin: string) => void
  onClose: () => void
}

export function useScanner({ onScan, onClose }: UseScannerProps) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [scanMode, setScanMode] = useState<'barcode' | 'ocr'>('barcode')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const workerRef = useRef<any>(null)
  const isScanning = useRef(false)

  const startOCRScanning = async () => {
    if (!isCameraActive || !workerRef.current || !isScanning.current || !videoRef.current || !canvasRef.current) return

    try {
      const frameData = captureFrame(videoRef.current, canvasRef.current)
      if (!frameData) {
        if (isScanning.current) {
          requestAnimationFrame(startOCRScanning)
        }
        return
      }

      const { data: { text } } = await workerRef.current.recognize(frameData)
      console.log('OCR Text:', text)
      
      const words = text.split(/\s+/)
      for (const word of words) {
        const cleaned = word.replace(/[^A-Z0-9]/gi, '').toUpperCase()
        if (validateVin(cleaned)) {
          onScan(cleaned)
          toast.success("VIN scanned successfully")
          onClose()
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
        if (validateVin(scannedValue)) {
          onScan(scannedValue)
          toast.success("VIN scanned successfully")
          onClose()
        } else {
          console.log("Invalid VIN format:", scannedValue)
          if (isScanning.current) {
            requestAnimationFrame(() => startScanning())
          }
        }
      } else if (isScanning.current) {
        requestAnimationFrame(() => startScanning())
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
        
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play()
            
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
              workerRef.current = await createWorker()
              await workerRef.current.loadLanguage('eng')
              await workerRef.current.initialize('eng')
              await workerRef.current.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
              })
              isScanning.current = true
              startOCRScanning()
            }
          } catch (error) {
            console.error('Error starting video:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Could not access camera. Please check camera permissions.")
      onClose()
    }
  }

  const toggleScanMode = async () => {
    isScanning.current = false
    stopCamera()
    setScanMode(prev => prev === 'barcode' ? 'ocr' : 'barcode')
    await startCamera()
  }

  useEffect(() => {
    return () => {
      isScanning.current = false
      stopCamera()
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  return {
    isCameraActive,
    scanMode,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    toggleScanMode
  }
}
