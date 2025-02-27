import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Clipboard, RotateCcw, Check, AlignLeft, Barcode, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createWorker, PSM } from 'tesseract.js'
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library'
import { validateVIN, postProcessVIN, validateVinWithNHTSA } from "@/utils/vin-validation"
import { useIsMobile } from "@/hooks/use-mobile"
import { preprocessImage } from "@/utils/image-processing"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { PageTitle } from "@/components/shared/PageTitle"

interface VehicleInfo {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
}

interface ExtendedTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

// Simple VIN decoder implementation since we don't have access to the imported one
const decodeVIN = (vin: string): {
  country: string;
  manufacturer: string;
  vehicleType: string;
} => {
  // Default return object
  const result = {
    country: 'Unknown',
    manufacturer: 'Unknown',
    vehicleType: 'Unknown',
  };
  
  if (!vin || vin.length !== 17) {
    return result;
  }
  
  // Extract codes
  const countryCode = vin.charAt(0);
  const manufacturerCode = vin.charAt(1);
  
  // Determine country of origin (1st character)
  const countryMap: {[key: string]: string} = {
    '1': 'United States',
    '4': 'United States',
    '5': 'United States',
    '2': 'Canada',
    '3': 'Mexico',
    'J': 'Japan',
    'K': 'South Korea',
    'L': 'China',
    'S': 'United Kingdom',
    'V': 'France/Spain',
    'W': 'Germany',
    'Y': 'Sweden/Finland',
    'Z': 'Italy',
    '9': 'Brazil'
  };
  result.country = countryMap[countryCode] || 'Unknown';
  
  // Determine manufacturer (2nd character)
  const manufacturerMap: {[key: string]: string} = {
    'A': 'Audi/Jaguar',
    'B': 'BMW/Dodge',
    'C': 'Chrysler',
    'F': 'Ford',
    'G': 'General Motors',
    'H': 'Honda/Hyundai',
    'J': 'Jeep',
    'L': 'Lincoln',
    'M': 'Mazda/Mercedes-Benz',
    'N': 'Nissan',
    'T': 'Toyota',
    'V': 'Volvo/Volkswagen'
  };
  result.manufacturer = manufacturerMap[manufacturerCode] || 'Unknown';
  
  // Set vehicle type based on WMI (first 3 characters)
  const wmi = vin.substring(0, 3);
  const vehicleTypeMap: {[key: string]: string} = {
    '1GC': 'Chevrolet Truck',
    '1G1': 'Chevrolet Passenger Car',
    '1GY': 'Cadillac',
    'JHM': 'Honda Passenger Car',
    'WBA': 'BMW Passenger Car',
    'WAU': 'Audi',
    '1FA': 'Ford Passenger Car',
    '1FT': 'Ford Truck',
    '2T1': 'Toyota Passenger Car (Canada)',
    '3VW': 'Volkswagen (Mexico)',
    '5YJ': 'Tesla',
    'JN1': 'Nissan Passenger Car',
    'JH4': 'Acura Passenger Car',
    'KM8': 'Hyundai SUV',
    'KND': 'Kia SUV',
    'WDD': 'Mercedes-Benz Passenger Car',
    'WP0': 'Porsche Passenger Car',
    'YV1': 'Volvo Passenger Car',
    // Add more as needed
  };
  result.vehicleType = vehicleTypeMap[wmi] || 'Unknown';
  
  return result;
};

export default function ScanVin() {
  console.log("ScanVin component rendered");
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location
  const returnPath = state?.returnPath || "/estimates/create"
  
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('text')
  const [logs, setLogs] = useState<string[]>([])
  const [hasFlash, setHasFlash] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [scanStartTime, setScanStartTime] = useState<Date | null>(null)
  const [lastScanDuration, setLastScanDuration] = useState<number | null>(null)
  const [detectedVehicle, setDetectedVehicle] = useState<VehicleInfo | null>(null)
  const [isConfirmationView, setIsConfirmationView] = useState(false)
  const [manualVin, setManualVin] = useState("")
  const [showLogs, setShowLogs] = useState(false)
  const [vehicleDetails, setVehicleDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const isMobile = useIsMobile()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<any>(null)
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanningRef = useRef<number>()
  const logsEndRef = useRef<HTMLDivElement>(null)
  const checkedVinsRef = useRef<Set<string>>(new Set())

  const addLog = (message: string) => {
    if (!isPaused) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        type: 'vin-scanner'
      }
      
      setLogs(prev => [...prev, message])
      
      const existingLogs = JSON.parse(localStorage.getItem('scanner-logs') || '[]')
      existingLogs.push(logEntry)
      localStorage.setItem('scanner-logs', JSON.stringify(existingLogs.slice(-1000)))
      
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  useEffect(() => {
    console.log("Starting camera on mount");
    startCamera()
    return () => {
      console.log("Stopping camera on unmount");
      stopCamera()
    }
  }, [])

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

  const correctCommonOcrMistakes = (text: string): string[] => {
    let cleanText = text
      .replace(/\s+/g, '')
      .toUpperCase();
    
    addLog(`Initial cleaned text: ${cleanText}`);

    if (cleanText.length !== 17) {
      addLog('Text length is not 17, proceeding with variations');
      return generateVinVariations(text);
    }

    const invalidChars = new Set(['I', 'O', 'Q']);
    const hasInvalidChars = [...cleanText].some(char => invalidChars.has(char));
    
    const ninthChar = cleanText[8];
    const isValidCheckDigit = /[0-9X]/.test(ninthChar);

    if (!hasInvalidChars && isValidCheckDigit) {
      addLog('Raw scan looks promising, testing before generating variations');
      if (validateVIN(cleanText)) {
        addLog('Raw scan is a valid VIN!');
        return [cleanText];
      }
      addLog('Raw scan validation failed, proceeding with variations');
    } else {
      addLog(`Found invalid characters or check digit, generating variations`);
      if (hasInvalidChars) {
        addLog(`Invalid characters detected: ${[...cleanText].filter(char => invalidChars.has(char)).join(', ')}`);
      }
      if (!isValidCheckDigit) {
        addLog(`Invalid check digit detected: ${ninthChar}`);
      }
    }

    return generateVinVariations(text);
  };

  const cleanVinBarcode = (scannedText: string): string => {
    let cleaned = scannedText.trim();
    
    if (cleaned.startsWith('I') && cleaned.length === 18) {
      addLog('Detected and removing leading I character from barcode scan');
      cleaned = cleaned.substring(1);
    }
    
    cleaned = cleaned.replace(/\s+/g, '').toUpperCase();
    
    return cleaned;
  };

  const generateVinVariations = (text: string): string[] => {
    const handle9thCharacter = (char: string): string => {
      if (/[0-9X]/.test(char)) {
        return char;
      }
      
      const checkDigitMappings: { [key: string]: string } = {
        'O': '0',
        'I': '1',
        'L': '1',
        'Z': '2',
        'E': '3',
        'A': '4',
        'H': '4',
        'S': '5',
        'G': '6',
        'T': '7',
        'B': '8',
        'Q': '9'
      }
      
      return checkDigitMappings[char] || '0';
    }

    let corrected = text
      .replace(/[oO]/g, '0')
      .replace(/[iIl|]/g, '1')
      .replace(/[sS]/g, '5')
      .replace(/[zZ]/g, '2')
      .replace(/[gG]/g, '6')
      .replace(/[tT]/g, '7')
      .replace(/\s+/g, '')
      .toUpperCase();

    if (corrected.length >= 9) {
      const beforeCheck = corrected.slice(0, 8);
      const afterCheck = corrected.slice(9);
      const checkDigit = handle9thCharacter(corrected[8]);
      corrected = beforeCheck + checkDigit + afterCheck;
    }

    const bOrEightPositions: number[] = [];
    corrected.split('').forEach((char, index) => {
      if (index !== 8 && (char === 'B' || char === '8')) {
        bOrEightPositions.push(index);
      }
    });

    const variations: string[] = [];
    const totalCombinations = Math.pow(2, bOrEightPositions.length);

    for (let i = 0; i < totalCombinations; i++) {
      let variant = corrected.split('');
      bOrEightPositions.forEach((pos, index) => {
        variant[pos] = (i & (1 << index)) ? 'B' : '8';
      });
      variations.push(variant.join(''));
    }

    if (variations.length === 0) {
      variations.push(corrected);
    }

    const vinPattern = /[A-HJ-NPR-Z0-9]{17}/;
    
    addLog(`Generated ${variations.length} possible variations`);
    variations.forEach((variant, index) => {
      addLog(`Variation ${index + 1}: ${variant}`);
      if (variant.length >= 9) {
        addLog(`Check digit (pos 9) in variation ${index + 1}: ${variant[8]}`);
      }
    });
    
    const validVariations = variations.filter(v => {
      const isValidFormat = vinPattern.test(v);
      const hasValidCheckDigit = v.length >= 9 && /[0-9X]/.test(v[8]);
      return isValidFormat && hasValidCheckDigit;
    });

    addLog(`Found ${validVariations.length} valid VIN pattern matches`);
    
    return validVariations;
  };

  const initializeWorker = async () => {
    try {
      addLog('Initializing OCR worker with enhanced settings...')
      const worker = await createWorker()
      
      await worker.reinitialize('eng')
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        preserve_interword_spaces: '0',
        tessedit_min_word_length: 17,
        tessjs_create_word_level_boxes: '1',
        tessjs_create_box: '1',
        debug_file: '/dev/null',
        tessjs_mock_parameter: '1'
      })

      addLog('OCR worker initialized with enhanced settings')
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
    setIsFlashOn(false)
  }

  const startCamera = async () => {
    try {
      setScanStartTime(new Date())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }).catch(async () => {
        addLog('Falling back to default camera...')
        return await navigator.mediaDevices.getUserMedia({
          video: true
        })
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        addLog('Stream acquired, initializing camera...')
        
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities() as ExtendedTrackCapabilities
        setHasFlash('torch' in capabilities)
        if ('torch' in capabilities) {
          addLog('Flash capability detected')
        }
        
        const settings = track.getSettings()
        addLog(`Camera: ${settings.facingMode || 'unknown'} facing`)
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
        
        await videoRef.current.play()
        addLog('Video stream started')
        setIsCameraActive(true)

        if (scanMode === 'text') {
          addLog('Starting OCR initialization...')
          workerRef.current = await initializeWorker()
          addLog('Worker reference created')
          
          let isCurrentlyScanning = true
          setIsScanning(isCurrentlyScanning)
          
          addLog(`Starting OCR scanning...`)
          await startOCRScanning(isCurrentlyScanning)
        } else {
          addLog('Initializing barcode reader...')
          await initializeBarcodeScanner()
        }
      }
    } catch (error) {
      addLog(`Error accessing camera: ${error}`)
      toast.error("Could not access camera. Please check camera permissions.")
    }
  }

  const initializeBarcodeScanner = async () => {
    try {
      const hints = new Map();
      const formats = [BarcodeFormat.CODE_39, BarcodeFormat.DATA_MATRIX, BarcodeFormat.CODE_128];
      hints.set(2, formats);
      hints.set(4, 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789');
      
      const codeReader = new BrowserMultiFormatReader(hints);
      barcodeReaderRef.current = codeReader;

      if (videoRef.current) {
        addLog('Starting enhanced barcode scanning for VIN codes...');
        
        const scanLoop = async () => {
          try {
            if (!videoRef.current || !barcodeReaderRef.current || isPaused) return;
            
            const result = await barcodeReaderRef.current.decodeOnce(videoRef.current);
            if (result?.getText()) {
              let scannedValue = result.getText();
              addLog(`Raw barcode detected: ${scannedValue}`);
              
              scannedValue = cleanVinBarcode(scannedValue);
              addLog(`Processed barcode: ${scannedValue}`);
              
              if (validateVIN(scannedValue)) {
                addLog('Valid VIN detected!');
                
                const vehicleInfo = await fetchVehicleInfo(scannedValue);
                if (vehicleInfo) {
                  const endTime = new Date();
                  const duration = scanStartTime ? (endTime.getTime() - scanStartTime.getTime()) / 1000 : 0;
                  setLastScanDuration(duration);
                  
                  addLog(`NHTSA validation passed - Valid VIN found in ${duration.toFixed(2)} seconds!`);
                  addLog(`Vehicle Info - Make: ${vehicleInfo.make}, Model: ${vehicleInfo.model}, Year: ${vehicleInfo.year}`);
                  
                  setDetectedVehicle(vehicleInfo);
                  setIsConfirmationView(true);
                  return;
                } else {
                  addLog('NHTSA lookup failed, but VIN format is valid - proceeding with confirmation');
                  const dummyVehicleInfo = {
                    vin: scannedValue,
                    make: "Unknown",
                    model: "Unknown",
                    year: "Unknown"
                  };
                  setDetectedVehicle(dummyVehicleInfo);
                  setIsConfirmationView(true);
                  return;
                }
              } else {
                addLog(`Invalid VIN format: ${scannedValue}`);
              }
            }
          } catch (error: any) {
            if (error?.name !== 'NotFoundException') {
              addLog(`Barcode scan error: ${error}`);
            }
          }
          
          requestAnimationFrame(scanLoop);
        };
        
        scanLoop();
      }
    } catch (error) {
      addLog(`Error initializing barcode scanner: ${error}`);
      throw error;
    }
  }

  const startOCRScanning = async (immediateScanning?: boolean) => {
    const shouldScan = immediateScanning ?? isScanning

    if (!streamRef.current || !workerRef.current || !shouldScan || isPaused) {
      return
    }

    try {
      const frameData = captureFrame()
      if (!frameData) {
        if (shouldScan) {
          scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
        }
        return
      }

      const { data: { text, confidence } } = await workerRef.current.recognize(frameData)
      
      addLog(`Raw scan result: ${text}`)
      addLog(`Raw confidence: ${confidence}%`)
      
      const possibleVins = correctCommonOcrMistakes(text)
      
      let foundValidVin = false
      
      for (const vin of possibleVins) {
        if (!checkedVinsRef.current.has(vin)) {
          addLog(`Checking new VIN variation: ${vin}`)
          checkedVinsRef.current.add(vin)
          const isValid = await checkVinValidity(vin)
          if (isValid) {
            foundValidVin = true
            break
          }
        } else {
          addLog(`Skipping already checked VIN: ${vin}`)
        }
      }

      if (!foundValidVin && shouldScan) {
        scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
      }
    } catch (error) {
      addLog(`OCR error: ${error}`)
      if (shouldScan) {
        scanningRef.current = requestAnimationFrame(() => startOCRScanning(shouldScan))
      }
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

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const scanAreaWidth = video.videoWidth * 0.95
    const scanAreaHeight = (40 / video.clientHeight) * video.videoHeight
    const startX = (video.videoWidth - scanAreaWidth) / 2
    const startY = (video.videoHeight - scanAreaHeight) / 2

    addLog(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`)
    addLog(`Scan area: ${Math.round(scanAreaWidth)}x${Math.round(scanAreaHeight)} px`)
    addLog(`Scan position: ${Math.round(startX)},${Math.round(startY)}`)

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

    const scaledCanvas = document.createElement('canvas')
    scaledCanvas.width = scanAreaWidth * 2
    scaledCanvas.height = scanAreaHeight * 2
    const scaledCtx = scaledCanvas.getContext('2d')
    
    if (scaledCtx) {
      scaledCtx.imageSmoothingEnabled = false
      scaledCtx.drawImage(
        tempCanvas,
        0, 0, tempCanvas.width, tempCanvas.height,
        0, 0, scaledCanvas.width, scaledCanvas.height
      )
    }

    return preprocessImage(scaledCanvas)
  }

  const fetchVehicleInfo = async (vin: string): Promise<VehicleInfo | null> => {
    setIsLoading(true)
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)
      if (!response.ok) return null
      
      const data = await response.json()
      const results = data.Results

      if (!Array.isArray(results)) return null

      const makeResult = results.find((r: any) => r.Variable === 'Make' && r.Value)
      const modelResult = results.find((r: any) => r.Variable === 'Model' && r.Value)
      const yearResult = results.find((r: any) => r.Variable === 'Model Year' && r.Value)

      setVehicleDetails(results)

      if (makeResult?.Value && modelResult?.Value && yearResult?.Value) {
        return {
          vin,
          make: makeResult.Value,
          model: modelResult.Value,
          year: yearResult.Value
        }
      }
    } catch (error) {
      addLog(`NHTSA API error: ${error}`)
    } finally {
      setIsLoading(false)
    }
    return null
  }

  const checkVinValidity = async (vin: string) => {
    addLog(`Checking possible VIN: ${vin}`)
    
    if (validateVIN(vin)) {
      addLog('Local VIN validation passed')
      const vehicleInfo = await fetchVehicleInfo(vin)
      
      if (vehicleInfo) {
        const endTime = new Date()
        const duration = scanStartTime ? (endTime.getTime() - scanStartTime.getTime()) / 1000 : 0
        setLastScanDuration(duration)
        
        addLog(`NHTSA validation passed - Valid VIN found in ${duration.toFixed(2)} seconds!`)
        addLog(`Vehicle Info - Make: ${vehicleInfo.make}, Model: ${vehicleInfo.model}, Year: ${vehicleInfo.year}`)
        
        setDetectedVehicle(vehicleInfo)
        setIsConfirmationView(true)
        return true
      } else {
        addLog('NHTSA validation failed - Could not decode vehicle info')
      }
    } else {
      addLog(`Local VIN validation failed - Invalid format`)
    }
    return false
  }

  const handleConfirm = () => {
    if (detectedVehicle) {
      console.log("Navigating back to:", returnPath, "with VIN:", detectedVehicle.vin);
      navigate(returnPath, { 
        state: { 
          scannedVin: detectedVehicle.vin,
          vehicleInfo: {
            make: detectedVehicle.make,
            model: detectedVehicle.model,
            year: detectedVehicle.year
          } 
        } 
      })
      toast.success("VIN confirmed and saved successfully")
    }
  }

  const handleCancel = () => {
    navigate(returnPath)
  }

  const handleTryAgain = () => {
    setIsConfirmationView(false)
    setDetectedVehicle(null)
    checkedVinsRef.current.clear()
    
    if (!videoRef.current?.srcObject) {
      startCamera().then(() => {
        startOCRScanning(true)
      })
    } else {
      startOCRScanning(true)
    }
  }

  const handleScanModeChange = async (value: 'text' | 'barcode') => {
    addLog(`Switching scan mode to: ${value}`)
    setScanMode(value)
    
    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current)
      scanningRef.current = undefined
    }
    
    if (workerRef.current) {
      addLog('Terminating OCR worker before mode change')
      await workerRef.current.terminate()
      workerRef.current = null
    }
    
    if (barcodeReaderRef.current) {
      addLog('Resetting barcode reader before mode change')
      barcodeReaderRef.current.reset()
      barcodeReaderRef.current = null
    }
    
    if (!isCameraActive || !streamRef.current) {
      addLog('Camera not active, restarting camera with new mode')
      stopCamera()
      await startCamera()
    } else {
      if (value === 'text') {
        addLog('Initializing OCR for text mode')
        workerRef.current = await initializeWorker()
        setIsScanning(true)
        startOCRScanning(true)
      } else {
        addLog('Initializing barcode scanner for barcode mode')
        await initializeBarcodeScanner()
      }
    }
  }

  const handleManualVinSubmit = async () => {
    if (manualVin.trim().length === 17) {
      if (validateVIN(manualVin)) {
        const processedVin = postProcessVIN(manualVin)
        const vehicleInfo = await fetchVehicleInfo(processedVin)
        
        if (vehicleInfo) {
          setDetectedVehicle(vehicleInfo)
          setIsConfirmationView(true)
        } else {
          const dummyVehicleInfo = {
            vin: processedVin,
            make: "Unknown",
            model: "Unknown",
            year: "Unknown"
          }
          setDetectedVehicle(dummyVehicleInfo)
          setIsConfirmationView(true)
        }
      } else {
        toast.error("Invalid VIN format")
      }
    } else {
      toast.error("VIN must be 17 characters long")
    }
  }

  const getVinDetails = () => {
    if (!detectedVehicle?.vin) return null
    
    return decodeVIN(detectedVehicle.vin)
  }
  
  const vinDetails = getVinDetails()

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Scan VIN</h1>
          <p className="text-sm text-muted-foreground">
            {isConfirmationView 
              ? "Verify the scanned VIN information" 
              : `Point your camera at a VIN ${scanMode === 'text' ? 'text' : 'barcode'} or manually enter the VIN`}
          </p>
        </div>
      </div>

      {isConfirmationView ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-lg mb-1">Scanned VIN</h2>
              <p className="font-mono text-lg">{detectedVehicle?.vin}</p>
            </CardContent>
          </Card>

          {isLoading ? (
            <Card className="bg-blue-50">
              <CardContent className="pt-6 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-opacity-50 border-t-primary rounded-full mx-auto mb-2"></div>
                  <p>Loading vehicle information...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {vinDetails && (
                <Card className="bg-blue-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        VIN Details
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-1">
                      <div className="text-sm"><span className="font-medium">Country:</span> {vinDetails.country}</div>
                      <div className="text-sm"><span className="font-medium">Manufacturer:</span> {vinDetails.manufacturer}</div>
                      <div className="text-sm"><span className="font-medium">Type:</span> {vinDetails.vehicleType}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {detectedVehicle?.make && detectedVehicle?.model && detectedVehicle?.year && (
                <Card className="bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Vehicle Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-lg font-semibold">{detectedVehicle.year} {detectedVehicle.make} {detectedVehicle.model}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={handleTryAgain}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Scan Again
            </Button>
            <Button 
              onClick={handleConfirm}
              className="w-full"
            >
              <Check className="mr-2 h-4 w-4" />
              Use This VIN
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between mb-4">
            <div className="flex space-x-2 items-center">
              {scanMode === 'text' ? (
                <Badge variant="default" className="h-8">
                  <AlignLeft className="mr-1 h-3 w-3" />
                  Text Mode
                </Badge>
              ) : (
                <Badge variant="default" className="h-8">
                  <Barcode className="mr-1 h-3 w-3" />
                  Barcode Mode
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
            >
              <AlignLeft className="mr-1 h-4 w-4" />
              Logs
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">Using preset: Default OCR Settings</p>

          <div className="relative bg-black rounded-lg overflow-hidden aspect-video w-full">
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
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="font-mono text-white text-xl">
                {detectedVehicle?.vin || ""}
              </div>
            </div>
            
            <div className="absolute bottom-2 right-2">
              <div className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Scanning for VIN...
              </div>
            </div>
            
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-16">
              <div className="absolute inset-0 border-2 border-white/60 rounded-lg" />
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Input
              placeholder="Enter VIN manually" 
              value={manualVin}
              onChange={e => setManualVin(e.target.value.toUpperCase())}
              maxLength={17}
              className="flex-1"
            />
            <Button 
              onClick={handleManualVinSubmit}
              className="shrink-0" 
              disabled={manualVin.length !== 17}
            >
              Use
            </Button>
          </div>

          <div className="mt-4 flex justify-between">
            <div className="space-x-2">
              <Label htmlFor="scan-mode" className="text-sm">Mode:</Label>
              <Switch
                id="scan-mode"
                checked={scanMode === "barcode"}
                onCheckedChange={(checked) =>
                  handleScanModeChange(checked ? "barcode" : "text")
                }
              />
              <Label
                htmlFor="scan-mode"
                className={`text-sm ${
                  scanMode === "barcode" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {scanMode === "barcode" ? "Barcode" : "Text"}
              </Label>
            </div>
            
            {hasFlash && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFlash}
              >
                Flash {isFlashOn ? "Off" : "On"}
              </Button>
            )}
          </div>

          {showLogs && (
            <Collapsible open={true} className="mt-4">
              <CollapsibleContent>
                <div className="bg-muted rounded-md p-2 h-32 overflow-y-auto text-xs font-mono">
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-muted-foreground">{log}</div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}

      <div className="mt-6">
        <Button variant="ghost" className="w-full" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
