import { useState, useRef, useEffect } from "react"
import { createWorker, PSM } from 'tesseract.js'
import { toast } from "sonner"
import { validateVIN, validateVinWithNHTSA } from "@/utils/vin-validation"

interface UseVinScannerProps {
  onScan: (vin: string) => void
  onClose: () => void
}

export interface ExtendedTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean
}

export const useVinScanner = ({ onScan, onClose }: UseVinScannerProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [hasFlash, setHasFlash] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<any>(null)
  const scanningRef = useRef<number>()
  const logsEndRef = useRef<HTMLDivElement>(null)
  const isProcessingRef = useRef(false)

  const addLog = (message: string) => {
    if (!isPaused) {
      setLogs(prev => [...prev, message])
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const correctCommonOcrMistakes = (text: string): string => {
    let corrected = text
      .replace(/[oO]/g, '0')
      .replace(/[iIl]/g, '1')
      .replace(/[sS]/g, '5')
      .replace(/[zZ]/g, '2')
      .replace(/[bB]/g, '8')
      .replace(/[gG]/g, '6')
      .replace(/\s+/g, '')
      .toUpperCase()

    const vinPattern = /[A-HJ-NPR-Z0-9]{17}/
    const match = corrected.match(vinPattern)
    return match ? match[0] : corrected
  }

  const initializeWorker = async () => {
    try {
      addLog('Creating OCR worker...')
      const worker = await createWorker()
      addLog('Worker created, initializing language...')
      
      await worker.reinitialize('eng')
      addLog('Language initialized, setting parameters...')
      
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        preserve_interword_spaces: '0',
        tessjs_create_box: '1',
        tessjs_create_unlock: '1'
      })
      
      addLog('OCR worker fully initialized')
      return worker
    } catch (error) {
      addLog(`Error initializing OCR worker: ${error}`)
      throw error
    }
  }

  const toggleFlash = async () => {
    if (!streamRef.current) return
    try {
      const track = streamRef.current.getVideoTracks()[0]
      const capabilities = track.getCapabilities() as ExtendedTrackCapabilities
      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn } as any]
        })
        setIsFlashOn(!isFlashOn)
        addLog(`Flash ${!isFlashOn ? 'enabled' : 'disabled'}`)
      }
    } catch (err) {
      addLog(`Flash control error: ${err}`)
      toast.error('Failed to toggle flash')
    }
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      addLog('Video or canvas reference not available')
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      addLog('Video not ready or context not available')
      return null
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const scanAreaWidth = video.videoWidth * 0.6
    const scanAreaHeight = video.videoHeight * 0.2
    const startX = (video.videoWidth - scanAreaWidth) / 2
    const startY = (video.videoHeight - scanAreaHeight) / 2

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = scanAreaWidth
    tempCanvas.height = scanAreaHeight
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) {
      addLog('Could not create temporary canvas context')
      return null
    }

    tempCtx.drawImage(
      video,
      startX, startY, scanAreaWidth, scanAreaHeight,
      0, 0, scanAreaWidth, scanAreaHeight
    )

    addLog('Frame captured successfully')
    return tempCanvas.toDataURL()
  }

  const startOCRScanning = async () => {
    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current)
    }

    if (isProcessingRef.current || isPaused) {
      return
    }

    if (!streamRef.current || !workerRef.current) {
      addLog('Scanning conditions not met:')
      addLog(`- Stream available: ${!!streamRef.current}`)
      addLog(`- Worker available: ${!!workerRef.current}`)
      return
    }

    try {
      isProcessingRef.current = true
      const frameData = captureFrame()
      
      if (!frameData) {
        addLog('No valid frame captured')
        isProcessingRef.current = false
        if (!isPaused) {
          scanningRef.current = requestAnimationFrame(startOCRScanning)
        }
        return
      }

      addLog('Processing frame with OCR...')
      const { data: { text, confidence } } = await workerRef.current.recognize(frameData)
      
      if (text.trim()) {
        addLog(`Raw text: "${text.trim()}" (${confidence.toFixed(1)}%)`)
      }
      
      const correctedText = correctCommonOcrMistakes(text)
      if (correctedText !== text.trim() && correctedText) {
        addLog(`Corrected text: "${correctedText}"`)
      }
      
      if (confidence > 40 && correctedText.length >= 15) {
        if (correctedText.length === 17 && validateVIN(correctedText)) {
          addLog('✓ Valid VIN format detected, validating with NHTSA...')
          const isValidVin = await validateVinWithNHTSA(correctedText)
          
          if (isValidVin) {
            addLog('✓ VIN validated successfully!')
            onScan(correctedText)
            toast.success("VIN scanned and validated successfully")
            onClose()
            return
          } else {
            addLog('✗ VIN validation failed')
          }
        }
      }

      isProcessingRef.current = false
      if (!isPaused) {
        scanningRef.current = requestAnimationFrame(startOCRScanning)
      }
    } catch (error) {
      addLog(`OCR error: ${error}`)
      isProcessingRef.current = false
      if (!isPaused) {
        scanningRef.current = requestAnimationFrame(startOCRScanning)
      }
    }
  }

  const startCamera = async () => {
    try {
      await stopCamera()

      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          zoom: 2.0,
          advanced: [{ zoom: 2.0 }] as any
        }
      }

      const fallbackConstraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          zoom: 2.0,
          advanced: [{ zoom: 2.0 }] as any
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          addLog('Stream acquired with back camera')
        }
      } catch (backCameraError) {
        addLog('Back camera not available, trying alternative camera...')
        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          addLog('Stream acquired with fallback camera')
        }
      }
      
      if (!videoRef.current) {
        throw new Error('Video element not available')
      }

      const track = streamRef.current?.getVideoTracks()[0]
      if (track) {
        const capabilities = track.getCapabilities() as ExtendedTrackCapabilities
        setHasFlash('torch' in capabilities)
        if ('torch' in capabilities) {
          addLog('Flash capability detected')
        }
      }
      
      addLog('Waiting for video to be ready...')
      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve()
        }
      })
      
      await videoRef.current.play()
      setIsCameraActive(true)
      addLog('Video stream started successfully')

      addLog('Initializing OCR worker...')
      workerRef.current = await initializeWorker()
      addLog('Starting OCR scanning loop...')
      startOCRScanning()
    } catch (error) {
      addLog(`Error accessing camera: ${error}`)
      toast.error("Could not access camera. Please check camera permissions.")
      onClose()
    }
  }

  const stopCamera = async () => {
    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current)
      scanningRef.current = undefined
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (workerRef.current) {
      try {
        await workerRef.current.terminate()
        workerRef.current = null
      } catch (error) {
        console.error('Error terminating worker:', error)
      }
    }

    setIsCameraActive(false)
    setIsFlashOn(false)
    isProcessingRef.current = false
    addLog('Camera and scanning stopped')
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    addLog(`Scanning ${!isPaused ? 'paused' : 'resumed'}`)
    if (isPaused && isCameraActive && workerRef.current) {
      startOCRScanning()
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return {
    videoRef,
    canvasRef,
    logsEndRef,
    logs,
    hasFlash,
    isFlashOn,
    isPaused,
    toggleFlash,
    togglePause,
    startCamera,
    stopCamera
  }
}
