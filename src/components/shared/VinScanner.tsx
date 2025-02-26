import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { createWorker, PSM } from 'tesseract.js'
import { BrowserMultiFormatReader } from '@zxing/library'
import { useIsMobile } from "@/hooks/use-mobile"
import { validateVIN, validateVinWithNHTSA } from "@/utils/vin-validation"
import { preprocessImage } from "@/utils/image-processing"
import { ScannerOverlay } from "./vin-scanner/ScannerOverlay"
import { ScannerFeedback } from "./vin-scanner/ScannerFeedback"

interface VinScannerProps {
  onScan: (vin: string) => void
}

interface CharacterConfidence {
  char: string;
  confidence: number;
  lastUpdated: number;
}

const OCR_SCAN_INTERVAL = 500; // Scan every 500ms
const CONFIDENCE_DECAY_TIME = 5000; // 5 seconds before confidence decay
const MIN_CHAR_CONFIDENCE = 40; // Minimum confidence to keep a character
const HIGH_CHAR_CONFIDENCE = 85; // Threshold for high-confidence characters

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [logs, setLogs] = useState<string[]>([])
  const [detectedText, setDetectedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>()
  const isMobile = useIsMobile()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<any>(null)
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanningRef = useRef<number>()
  const logsEndRef = useRef<HTMLDivElement>(null)
  const lastScanRef = useRef<number>(0)
  const confidenceMapRef = useRef<CharacterConfidence[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const initializeWorker = async () => {
    try {
      addLog('Initializing OCR worker with VIN-specific optimizations...')
      const worker = await createWorker()
      
      await worker.reinitialize('eng')
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHJKLMNPRSTUVWXYZ',
        tessedit_ocr_engine_mode: '3', // Neural nets LSTM only
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0',
        debug_file: '/dev/null',
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        classify_bln_numeric_mode: '1',
        textord_pitch_range: '0',
        textord_fixed_pitch_threshold: '0',
        edges_children_fix: '1',
        edges_max_children_per_outline: '40',
        edges_min_nonhole: '40',
        edges_patharea_ratio: '2.0',
        tessedit_do_invert: '0',
        textord_heavy_nr: '0',
        language_model_penalty_non_freq_dict_word: '0.5',
        language_model_penalty_non_dict_word: '0.5',
        tessjs_image_dpi: '300',
        tessedit_dpi: '300'
      })

      addLog('OCR worker initialized')
      return worker
    } catch (error) {
      addLog(`Error initializing OCR worker: ${error}`)
      throw error
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current)
    }
    if (barcodeReaderRef.current) {
      barcodeReaderRef.current.reset()
      barcodeReaderRef.current = null
    }
    setIsCameraActive(false)
    setIsScanning(false)
  }

  const startCamera = async () => {
    try {
      setError(undefined)
      setDetectedText("")
      setIsProcessing(false)

      const constraints: MediaTrackConstraints = {
        facingMode: 'environment',
        width: { ideal: isMobile ? 1920 : 1280 },
        height: { ideal: isMobile ? 1080 : 720 },
        frameRate: { ideal: 30 }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: constraints })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        addLog('Stream acquired, initializing camera...')
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
        
        await videoRef.current.play()
        addLog('Video stream started')

        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        if ('torch' in capabilities) {
          try {
            await track.applyConstraints({
              advanced: [{ [capabilities.torch ? 'torch' : '']: true }]
            })
            addLog('Torch enabled')
          } catch (error) {
            addLog('Torch not available or permission denied')
          }
        }

        if (scanMode === 'text') {
          addLog('Starting OCR initialization...')
          workerRef.current = await initializeWorker()
          addLog('Worker reference created')
          
          setIsScanning(true)
          addLog('Starting OCR scanning...')
          await startOCRScanning(true)
        } else {
          addLog('Initializing barcode reader...')
          await initializeBarcodeScanner()
        }
      }
    } catch (error) {
      addLog(`Error accessing camera: ${error}`)
      setError("Could not access camera. Please check camera permissions.")
      toast.error("Could not access camera. Please check camera permissions.")
      setIsDialogOpen(false)
    }
  }

  const initializeBarcodeScanner = async () => {
    try {
      const codeReader = new BrowserMultiFormatReader()
      barcodeReaderRef.current = codeReader

      if (videoRef.current) {
        addLog('Starting barcode scanning...')
        
        const scanLoop = async () => {
          try {
            const now = Date.now()
            if (now - lastScanRef.current < 500) { // Check every 500ms
              if (isDialogOpen) {
                requestAnimationFrame(scanLoop)
              }
              return
            }
            
            lastScanRef.current = now
            setIsProcessing(true)

            if (!videoRef.current || !barcodeReaderRef.current) return;
            
            const result = await barcodeReaderRef.current.decodeOnce(videoRef.current);
            if (result?.getText()) {
              const scannedValue = result.getText()
              setDetectedText(scannedValue)
              addLog(`Barcode detected: ${scannedValue}`)
              
              if (validateVIN(scannedValue)) {
                addLog('Valid VIN detected!')
                onScan(scannedValue.toUpperCase())
                toast.success("VIN scanned successfully")
                handleClose()
                return
              } else {
                setError("Invalid VIN format detected")
              }
            }
          } catch (error: any) {
            if (error?.name !== 'NotFoundException') {
              addLog(`Barcode scan error: ${error}`)
              setError("Error scanning barcode")
            }
          } finally {
            setIsProcessing(false)
          }
          
          if (isDialogOpen) {
            requestAnimationFrame(scanLoop)
          }
        }
        
        scanLoop()
      }
    } catch (error) {
      addLog(`Error initializing barcode scanner: ${error}`)
      setError("Failed to initialize barcode scanner")
      throw error
    }
  }

  const startOCRScanning = async (immediateScanning?: boolean) => {
    const shouldScan = immediateScanning ?? isScanning

    if (!streamRef.current || !workerRef.current || !shouldScan) {
      return
    }

    try {
      const now = Date.now()
      if (now - lastScanRef.current < OCR_SCAN_INTERVAL) {
        if (shouldScan) {
          scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan));
        }
        return
      }

      lastScanRef.current = now
      setIsProcessing(true)
      setError(undefined)

      const frameData = captureFrame()
      if (!frameData) {
        if (shouldScan) {
          scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan));
        }
        return
      }

      const { data } = await workerRef.current.recognize(frameData)
      const text = data.text
      const words = data.words || []

      let processedText = ''
      let overallConfidence = 0
      let charCount = 0

      words.forEach((word: any) => {
        const normalizedText = word.text.toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .replace(/[OoQq]/g, '0')
          .replace(/[IiLl]/g, '1')
          .replace(/[Ss]/g, '5')
          .replace(/[Zz]/g, '2')
          .replace(/[Bb]/g, '8')
          .replace(/[Gg]/g, '6')

        const charConfidence = word.confidence / word.text.length

        normalizedText.split('').forEach((char: string) => {
          if (charCount < 17) {
            const processedChar = updateCharacterConfidence(charCount, char, charConfidence)
            processedText += processedChar
            overallConfidence += charConfidence
            charCount++
          }
        })
      })

      while (processedText.length < 17 && confidenceMapRef.current.length > processedText.length) {
        const existing = confidenceMapRef.current[processedText.length]
        if (existing && existing.confidence > MIN_CHAR_CONFIDENCE) {
          processedText += existing.char
          overallConfidence += existing.confidence
          charCount++
        } else {
          break
        }
      }

      if (charCount > 0) {
        overallConfidence = overallConfidence / charCount
      }

      setDetectedText(processedText)
      addLog(`Detected text: ${processedText} (avg confidence: ${overallConfidence.toFixed(1)}%)`)

      const highConfidenceChars = confidenceMapRef.current
        .filter(c => c && c.confidence > HIGH_CHAR_CONFIDENCE)
        .map(c => `${c.char}(${c.confidence.toFixed(1)}%)`)
      if (highConfidenceChars.length > 0) {
        addLog(`High confidence chars: ${highConfidenceChars.join(', ')}`)
      }

      if (processedText.length === 17 && validateVIN(processedText)) {
        const isValidVin = await validateVinWithNHTSA(processedText)
        
        if (isValidVin) {
          onScan(processedText)
          toast.success("VIN scanned successfully")
          handleClose()
          return
        } else {
          setError("VIN validation failed")
        }
      } else if (processedText.length === 17) {
        setError("Invalid VIN format")
      }
      
      if (shouldScan) {
        scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
      }
    } catch (error) {
      addLog(`OCR error: ${error}`)
      setError("Error processing scan")
      if (shouldScan) {
        scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      return null
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return null
    }

    const scanAreaWidth = video.videoWidth * (isMobile ? 0.8 : 0.7)
    const scanAreaHeight = video.videoHeight * (isMobile ? 0.2 : 0.15)
    const startX = (video.videoWidth - scanAreaWidth) / 2
    const startY = (video.videoHeight - scanAreaHeight) / 2

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = scanAreaWidth
    tempCanvas.height = scanAreaHeight
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) {
      return null
    }

    tempCtx.drawImage(
      video,
      startX, startY, scanAreaWidth, scanAreaHeight,
      0, 0, scanAreaWidth, scanAreaHeight
    )

    return preprocessImage(tempCanvas)
  }

  const updateCharacterConfidence = (position: number, char: string, confidence: number) => {
    const now = Date.now()
    const existing = confidenceMapRef.current[position]

    if (existing && existing.confidence > confidence) {
      const timeDiff = now - existing.lastUpdated
      if (timeDiff > CONFIDENCE_DECAY_TIME) {
        const decayFactor = Math.max(0, 1 - (timeDiff - CONFIDENCE_DECAY_TIME) / 10000)
        existing.confidence *= decayFactor
      }
      return existing.char
    }

    confidenceMapRef.current[position] = {
      char,
      confidence,
      lastUpdated: now
    }
    return char
  }

  const handleClose = async () => {
    stopCamera()
    if (workerRef.current) {
      await workerRef.current.terminate()
      workerRef.current = null
    }
    confidenceMapRef.current = []
    setIsDialogOpen(false)
    setLogs([])
  }

  const handleOpen = async () => {
    setIsDialogOpen(true)
    setLogs([])
    await startCamera()
  }

  const handleScanModeChange = async (value: string) => {
    if (value === 'text' || value === 'barcode') {
      setScanMode(value)
      stopCamera()
      setLogs([])
      await startCamera()
    }
  }

  useEffect(() => {
    return () => {
      handleClose()
    }
  }, [])

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="icon"
        onClick={handleOpen}
        className="shrink-0"
      >
        <Camera className="h-4 w-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0">
          <ScannerOverlay
            scanMode={scanMode}
            onScanModeChange={handleScanModeChange}
          />
          <div className="relative aspect-video w-full overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              autoPlay
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full object-cover opacity-0"
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 sm:w-2/3 h-1/5 border-2 border-dashed border-primary-foreground/70">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                Position {scanMode === 'text' ? 'VIN text' : 'barcode'} here
              </div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-primary-foreground/70" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <p className="text-white text-center text-sm">
                Position the {scanMode === 'text' ? 'VIN text' : 'barcode'} within the frame
              </p>
            </div>
          </div>

          <ScannerFeedback 
            detectedText={detectedText}
            isProcessing={isProcessing}
            error={error}
          />

          <div className="bg-muted p-4 max-h-32 overflow-y-auto text-xs font-mono">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-muted-foreground">{log}</div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
