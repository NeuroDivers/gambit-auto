
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BrowserMultiFormatReader } from '@zxing/library'
import { createWorker } from 'tesseract.js'
import { ArrowLeft, Camera, Clipboard, Text, Barcode, List } from "lucide-react"
import { toast } from 'sonner'
import { Toggle } from "@/components/ui/toggle"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { postProcessVIN } from '@/utils/vin-validation'

export default function VinScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/admin/estimates'
  const returnPath = returnTo || '/admin/estimates'
  const navigate = useNavigate()
  const [manualVin, setManualVin] = useState('')
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [logs, setLogs] = useState<string[]>([])
  const [logsOpen, setLogsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [worker, setWorker] = useState<Tesseract.Worker | null>(null)
  const scanIntervalRef = useRef<number | null>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  // Initialize Tesseract worker
  useEffect(() => {
    const initWorker = async () => {
      try {
        addLog("Initializing OCR engine...")
        const newWorker = await createWorker('eng')
        addLog("OCR engine initialized")
        setWorker(newWorker)
      } catch (err) {
        console.error('Failed to initialize Tesseract worker:', err)
        addLog(`Failed to initialize OCR engine: ${err instanceof Error ? err.message : 'Unknown error'}`)
        toast.error('Error initializing text recognition. Try barcode mode instead.')
      }
    }

    initWorker()

    return () => {
      if (worker) {
        worker.terminate()
        addLog("OCR engine terminated")
      }
    }
  }, [])

  // Barcode scanning setup
  useEffect(() => {
    if (scanMode !== 'barcode') return
    
    addLog('Starting barcode scanner')
    
    const codeReader = new BrowserMultiFormatReader()
    let selectedDeviceId: string | undefined

    codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length <= 0) {
          const errorMsg = 'No video input devices detected'
          console.error(errorMsg)
          addLog(errorMsg)
          return
        }

        // Log available devices
        videoInputDevices.forEach(device => {
          addLog(`Found camera: ${device.label || 'Unnamed camera'}`)
        })

        // Select the rear camera if available, otherwise use the first camera
        const rearCamera = videoInputDevices.find(device => 
          /back|rear/i.test(device.label)
        )
        selectedDeviceId = rearCamera?.deviceId || videoInputDevices[0].deviceId
        
        addLog(`Selected camera: ${videoInputDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Unknown camera'}`)
        addLog(`Scan mode: ${scanMode}`)

        return codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const vinCode = result.getText()
              console.log('Scanned VIN barcode:', vinCode)
              addLog(`Successfully scanned barcode: ${vinCode}`)
              navigateWithResult(vinCode)
            }
            if (error && !(error instanceof TypeError)) {
              // TypeError is thrown when the scanner is stopped, so we ignore it
              console.error('Scanner error:', error)
              // Only log certain errors to avoid flooding the log
              if (!error.message.includes('No MultiFormat Readers were able to detect the code')) {
                addLog(`Error: ${error.message || 'Unknown scanner error'}`)
              }
            }
          }
        )
      })
      .catch(err => {
        console.error('Error starting scanner:', err)
        addLog(`Failed to start scanner: ${err.message || 'Unknown error'}`)
        toast.error('Error accessing camera. Please check permissions.')
      })

    return () => {
      addLog('Barcode scanner stopped')
      codeReader.reset()
    }
  }, [scanMode, navigate])

  // Text scanning setup
  useEffect(() => {
    if (scanMode !== 'text' || !worker || !videoRef.current) return

    addLog('Starting text scanner')
    
    // Setup camera for text scanning
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    })
    .then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Setup canvas for capturing frames
        if (!canvasRef.current) {
          const canvas = document.createElement('canvas')
          canvas.style.display = 'none'
          document.body.appendChild(canvas)
          canvasRef.current = canvas
        }
        
        addLog('Text scanner ready')
        
        // Start periodic scanning for text
        startTextScanning()
      }
    })
    .catch((err) => {
      console.error('Error accessing camera for text scanning:', err)
      addLog(`Failed to access camera: ${err.message || 'Unknown error'}`)
      toast.error('Error accessing camera. Please check permissions.')
    })
    
    return () => {
      stopTextScanning()
      
      // Stop video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
        addLog('Text scanner stopped')
      }
    }
  }, [scanMode, worker, navigate])
  
  const startTextScanning = () => {
    if (isScanning || !worker) return
    
    setIsScanning(true)
    addLog('Starting text recognition')
    
    // Run OCR every 3 seconds
    scanIntervalRef.current = window.setInterval(captureAndRecognize, 3000)
  }
  
  const stopTextScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
  }
  
  const captureAndRecognize = async () => {
    if (!worker || !videoRef.current || !canvasRef.current) return
    
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Process image with OCR
      addLog('Analyzing image for VIN...')
      const { data } = await worker.recognize(canvas)
      
      // Process OCR result for potential VINs
      const text = data.text.replace(/\s+/g, '')
      addLog(`OCR detected text: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`)
      
      // Look for 17-character sequences that might be VINs
      const vinPattern = /[A-HJ-NPR-Z0-9]{17}/g
      const potentialVins = text.match(vinPattern)
      
      if (potentialVins && potentialVins.length > 0) {
        const vin = postProcessVIN(potentialVins[0])
        addLog(`Potential VIN detected: ${vin}`)
        
        // Pause scanning while processing result
        stopTextScanning()
        
        // Navigate with result
        navigateWithResult(vin)
      }
    } catch (err) {
      console.error('Error in OCR process:', err)
      addLog(`OCR error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const navigateWithResult = (vin: string) => {
    // Store result in sessionStorage to pass to the previous page
    console.log('VinScannerPage: Storing scanned VIN in sessionStorage:', vin)
    addLog(`Storing VIN in session storage: ${vin}`)
    sessionStorage.setItem('scanned-vin', vin)
    toast.success(`VIN scanned: ${vin}`)
    
    // A small delay to ensure the data is saved before navigation
    setTimeout(() => {
      addLog(`Navigating back to: ${returnPath}`)
      navigate(returnPath)
    }, 100)
  }

  const handlePasteVin = async () => {
    try {
      const text = await navigator.clipboard.readText()
      addLog(`Pasted text from clipboard: ${text}`)
      if (text && text.length >= 17) {
        setManualVin(text)
      }
    } catch (err) {
      console.error('Failed to read clipboard contents:', err)
      addLog(`Failed to access clipboard: ${err instanceof Error ? err.message : 'Unknown error'}`)
      toast.error('Could not access clipboard. Please enter VIN manually.')
    }
  }

  const handleUseManualVin = () => {
    addLog(`Using manually entered VIN: ${manualVin}`)
    if (manualVin.length >= 17) {
      navigateWithResult(manualVin)
    } else {
      addLog(`Invalid VIN length: ${manualVin.length} (expected 17 or more)`)
      toast.error('Please enter a valid VIN (17 characters)')
    }
  }

  const navigateBack = () => {
    addLog(`User canceled. Returning to: ${returnPath}`)
    navigate(returnPath)
  }

  const toggleScanMode = () => {
    // Stop current scanning processes
    stopTextScanning()
    
    // Toggle mode
    setScanMode(prevMode => prevMode === 'barcode' ? 'text' : 'barcode')
    addLog(`Changing scan mode from ${scanMode} to ${scanMode === 'barcode' ? 'text' : 'barcode'}`)
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={navigateBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Scan VIN</CardTitle>
              <CardDescription>
                Point your camera at a VIN {scanMode === 'barcode' ? 'barcode' : 'text'} or manually enter the VIN
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Toggle 
                pressed={scanMode === 'barcode'}
                onPressedChange={toggleScanMode}
                aria-label="Toggle scan mode"
              >
                {scanMode === 'barcode' ? <Barcode className="h-4 w-4 mr-1" /> : <Text className="h-4 w-4 mr-1" />}
                {scanMode === 'barcode' ? 'Barcode' : 'Text'} Mode
              </Toggle>
            </div>
            <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <List className="h-4 w-4 mr-1" />
                  Logs
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          <div className="bg-black relative rounded-md overflow-hidden aspect-video">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 border-2 border-primary/50 rounded-md pointer-events-none" />
            {isScanning && scanMode === 'text' && (
              <div className="absolute bottom-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full animate-pulse">
                Scanning for VIN...
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualVin}
                onChange={(e) => setManualVin(e.target.value)}
                placeholder="Enter VIN manually"
                className="w-full px-3 py-2 border rounded-md"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handlePasteVin}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleUseManualVin}>Use</Button>
          </div>

          <Collapsible open={logsOpen}>
            <CollapsibleContent>
              <div className="border rounded-md mt-2 bg-gray-50 dark:bg-gray-900">
                <div className="p-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                  {logs.length === 0 ? (
                    <p>No logs yet</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="py-0.5">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        <CardFooter>
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={navigateBack}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
