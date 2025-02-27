
import { Camera, Pause, Play, Check, X as XIcon, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { createWorker, PSM } from 'tesseract.js'
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library'
import { useIsMobile } from "@/hooks/use-mobile"
import { validateVIN, validateVinWithNHTSA } from "@/utils/vin-validation"
import { preprocessImage } from "@/utils/image-processing"
import { ScannerOverlay } from "./vin-scanner/ScannerOverlay"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VinScannerProps {
  onScan: (vin: string) => void
}

interface ExtendedTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface VehicleInfo {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
}

// OCR presets - different configurations for Tesseract
interface OcrPreset {
  name: string;
  description: string;
  config: {
    whitelist?: string;
    pagesegMode?: PSM;
    preserveInterwordSpaces?: string;
    minWordLength?: number;
    createWordBoxes?: string;
    createBoxes?: string;
  }
}

const ocrPresets: OcrPreset[] = [
  {
    name: "Default",
    description: "Balanced accuracy for most VIN formats",
    config: {
      whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      pagesegMode: PSM.SINGLE_LINE,
      preserveInterwordSpaces: "0",
      minWordLength: 17,
      createWordBoxes: "1",
      createBoxes: "1"
    }
  },
  {
    name: "Windshield Scanning",
    description: "Optimized for reading VINs through windshield glass",
    config: {
      whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      pagesegMode: PSM.SINGLE_BLOCK,
      preserveInterwordSpaces: "0",
      minWordLength: 17,
      createWordBoxes: "1",
      createBoxes: "1"
    }
  },
  {
    name: "Monitor/Screen",
    description: "For VINs displayed on digital screens",
    config: {
      whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      pagesegMode: PSM.SINGLE_LINE,
      preserveInterwordSpaces: "0",
      minWordLength: 17,
      createWordBoxes: "1",
      createBoxes: "1"
    }
  },
  {
    name: "Low Light",
    description: "Enhanced for poor lighting conditions",
    config: {
      whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      pagesegMode: PSM.SINGLE_BLOCK,
      preserveInterwordSpaces: "0",
      minWordLength: 17,
      createWordBoxes: "1",
      createBoxes: "1"
    }
  },
  {
    name: "Bright Light",
    description: "For dealing with glare and reflections",
    config: {
      whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      pagesegMode: PSM.SINGLE_BLOCK,
      preserveInterwordSpaces: "0",
      minWordLength: 17,
      createWordBoxes: "1",
      createBoxes: "1"
    }
  },
  {
    name: "Paper Document",
    description: "For printed VINs on paper documents",
    config: {
      whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      pagesegMode: PSM.RAW_LINE,
      preserveInterwordSpaces: "0",
      minWordLength: 17,
      createWordBoxes: "1",
      createBoxes: "1"
    }
  },
  {
    name: "High Precision",
    description: "More accurate but slower scanning",
    config: {
      whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      pagesegMode: PSM.SINGLE_BLOCK,
      preserveInterwordSpaces: "0",
      minWordLength: 17,
      createWordBoxes: "1",
      createBoxes: "1"
    }
  },
  {
    name: "Fast Scan",
    description: "Quicker but less accurate",
    config: {
      whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      pagesegMode: PSM.SPARSE_TEXT,
      preserveInterwordSpaces: "0",
      minWordLength: 15,
      createWordBoxes: "0",
      createBoxes: "0"
    }
  },
  {
    name: "Faded Text",
    description: "Better for hard-to-read VINs",
    config: {
      whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      pagesegMode: PSM.SINGLE_WORD,
      preserveInterwordSpaces: "0",
      minWordLength: 15,
      createWordBoxes: "1",
      createBoxes: "1"
    }
  }
];

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  // Change default scan mode to 'barcode'
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('barcode')
  const [ocrPreset, setOcrPreset] = useState<string>("Default")
  const [logs, setLogs] = useState<string[]>([])
  const [hasFlash, setHasFlash] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [scanStartTime, setScanStartTime] = useState<Date | null>(null)
  const [lastScanDuration, setLastScanDuration] = useState<number | null>(null)
  const [detectedVehicle, setDetectedVehicle] = useState<VehicleInfo | null>(null)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [remainingVariations, setRemainingVariations] = useState<string[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const isMobile = useIsMobile()
  // Flag to track if the dialog was manually closed
  const manualCloseRef = useRef(false)

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

  // Also used for processing barcode scan results
  const cleanVinBarcode = (scannedText: string): string => {
    // Remove any leading 'I' characters (common barcode scanning error)
    let cleaned = scannedText.trim();
    
    // Some barcode scanners add an 'I' prefix to the VIN
    if (cleaned.startsWith('I') && cleaned.length === 18) {
      addLog('Detected and removing leading I character from barcode scan');
      cleaned = cleaned.substring(1);
    }
    
    // Remove any whitespace and make uppercase
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

  const compareVins = (detected: string, expected: string): string => {
    if (detected.length !== expected.length) {
      return `Length mismatch: detected=${detected.length}, expected=${expected.length}`
    }

    let diff = ''
    for (let i = 0; i < expected.length; i++) {
      if (detected[i] !== expected[i]) {
        diff += `pos ${i}: ${detected[i]} should be ${expected[i]}; `
      }
    }
    return diff || 'Perfect match!'
  }

  const getCurrentOcrPreset = (): OcrPreset => {
    return ocrPresets.find(preset => preset.name === ocrPreset) || ocrPresets[0];
  };

  const initializeWorker = async () => {
    try {
      const selectedPreset = getCurrentOcrPreset();
      addLog(`Initializing OCR worker with ${selectedPreset.name} settings...`);
      
      const worker = await createWorker();
      
      await worker.reinitialize('eng');
      
      // Apply the selected preset configuration
      await worker.setParameters({
        tessedit_char_whitelist: selectedPreset.config.whitelist,
        tessedit_pageseg_mode: selectedPreset.config.pagesegMode,
        preserve_interword_spaces: selectedPreset.config.preserveInterwordSpaces,
        tessedit_min_word_length: selectedPreset.config.minWordLength,
        tessjs_create_word_level_boxes: selectedPreset.config.createWordBoxes,
        tessjs_create_box: selectedPreset.config.createBoxes,
        debug_file: '/dev/null',
        tessjs_mock_parameter: '1'
      });

      addLog(`OCR worker initialized with ${selectedPreset.name} settings`);
      return worker;
    } catch (error) {
      addLog(`Error initializing OCR worker: ${error}`);
      throw error;
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
      setIsDialogOpen(false)
    }
  }

  const initializeBarcodeScanner = async () => {
    try {
      // Create barcode reader with specific hints for VIN barcodes
      const hints = new Map();
      // Format hint - focus on Code 39 and Data Matrix which are commonly used for VIN barcodes
      const formats = [BarcodeFormat.CODE_39, BarcodeFormat.DATA_MATRIX, BarcodeFormat.CODE_128];
      hints.set(2, formats); // 2 is FORMAT_HINT_TYPE

      // Try to make character set more restrictive for VINs (A-Z, 0-9)
      hints.set(4, 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'); // 4 is CHARACTER_SET hint

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
              
              // Process the barcode to handle common issues
              scannedValue = cleanVinBarcode(scannedValue);
              addLog(`Processed barcode: ${scannedValue}`);
              
              // For barcode scans, skip local VIN validation if length is 17
              if (scannedValue.length === 17) {
                addLog('Barcode VIN has valid length, proceeding with NHTSA validation');
                
                // Attempt to get vehicle info for confirmation
                const vehicleInfo = await fetchVehicleInfo(scannedValue);
                if (vehicleInfo) {
                  const endTime = new Date();
                  const duration = scanStartTime ? (endTime.getTime() - scanStartTime.getTime()) / 1000 : 0;
                  setLastScanDuration(duration);
                  
                  addLog(`NHTSA validation passed - Valid VIN found in ${duration.toFixed(2)} seconds!`);
                  addLog(`Vehicle Info - Make: ${vehicleInfo.make}, Model: ${vehicleInfo.model}, Year: ${vehicleInfo.year}`);
                  
                  setDetectedVehicle(vehicleInfo);
                  setIsConfirmationOpen(true);
                  return;
                } else {
                  // VIN format is valid but couldn't fetch vehicle info
                  // Still allow confirmation as the VIN might be valid but not in NHTSA database
                  addLog('NHTSA lookup failed, but barcode data appears to be a valid VIN - proceeding with confirmation');
                  const dummyVehicleInfo = {
                    vin: scannedValue,
                    make: "Unknown",
                    model: "Unknown",
                    year: "Unknown"
                  };
                  setDetectedVehicle(dummyVehicleInfo);
                  setIsConfirmationOpen(true);
                  return;
                }
              } else {
                // Invalid VIN - log and continue scanning
                addLog(`Invalid VIN length (${scannedValue.length}): ${scannedValue}`);
              }
            }
          } catch (error: any) {
            if (error?.name !== 'NotFoundException') {
              addLog(`Barcode scan error: ${error}`);
            }
          }
          
          // Continue scanning loop if dialog is still open
          if (isDialogOpen) {
            requestAnimationFrame(scanLoop);
          }
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
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)
      if (!response.ok) return null
      
      const data = await response.json()
      const results = data.Results

      if (!Array.isArray(results)) return null

      const makeResult = results.find((r: any) => r.Variable === 'Make' && r.Value)
      const modelResult = results.find((r: any) => r.Variable === 'Model' && r.Value)
      const yearResult = results.find((r: any) => r.Variable === 'Model Year' && r.Value)

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
        setIsConfirmationOpen(true)
        return true
      } else {
        addLog('NHTSA validation failed - Could not decode vehicle info')
      }
    } else {
      addLog(`Local VIN validation failed - Invalid format`)
    }
    return false
  }

  const handleConfirm = (confirmed: boolean) => {
    setIsConfirmationOpen(false)
    
    if (confirmed && detectedVehicle) {
      onScan(detectedVehicle.vin)
      toast.success("VIN confirmed and saved successfully")
      handleClose()
    } else {
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
  }

  const handleClose = () => {
    manualCloseRef.current = true
    stopCamera()
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    setIsDialogOpen(false)
    setLogs([])
    setShowLogs(false)
    checkedVinsRef.current.clear()
  }

  const handleOpen = async () => {
    manualCloseRef.current = false
    setIsDialogOpen(true)
    setLogs([])
    await startCamera()
  }

  const handleScanModeChange = async (value: string) => {
    if (value === 'text' || value === 'barcode') {
      addLog(`Switching scan mode to: ${value}`)
      setScanMode(value as 'text' | 'barcode')
      
      // First properly clean up the current mode
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
      
      // Need to ensure we have an active camera before switching modes
      if (!isCameraActive || !streamRef.current) {
        addLog('Camera not active, restarting camera with new mode')
        stopCamera()
        await startCamera()
      } else {
        // Camera is already active, just initialize the new scanner mode
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
  }

  const handleOcrPresetChange = async (value: string) => {
    setOcrPreset(value);
    addLog(`Switching OCR preset to: ${value}`);
    
    // Only restart OCR if we're currently in text mode
    if (scanMode === 'text') {
      if (workerRef.current) {
        addLog('Terminating OCR worker to apply new preset');
        await workerRef.current.terminate();
        workerRef.current = null;
      }
      
      addLog('Reinitializing OCR with new preset');
      workerRef.current = await initializeWorker();
      setIsScanning(true);
      startOCRScanning(true);
    }
  };

  // Handle orientation change
  useEffect(() => {
    // Prevent the dialog from closing on orientation change
    const handleOrientationChange = () => {
      addLog('Orientation change detected')
      
      if (!isDialogOpen || manualCloseRef.current) return
      
      // If the dialog was open and not manually closed,
      // ensure it stays open and camera remains active
      if (!isCameraActive && streamRef.current === null) {
        addLog('Restarting camera after orientation change')
        startCamera().catch(error => {
          addLog(`Failed to restart camera: ${error}`)
        })
      }
    }

    // Listen for orientation change and resize events
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [isDialogOpen, isCameraActive])

  useEffect(() => {
    return () => {
      if (isDialogOpen) {
        handleClose()
      }
    }
  }, [])
  
  const currentPreset = getCurrentOcrPreset();

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

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}>
        <DialogContent 
          className="sm:max-w-md p-0 h-[100dvh] sm:h-auto [&>button]:hidden flex flex-col"
        >
          <ScannerOverlay
            scanMode={scanMode}
            onScanModeChange={handleScanModeChange}
            hasFlash={hasFlash}
            isFlashOn={isFlashOn}
            onFlashToggle={toggleFlash}
            onClose={handleClose}
          />
          
          {scanMode === 'text' && (
            <div className="bg-background px-4 py-2 border-b">
              <Label htmlFor="modal-ocr-preset" className="text-sm mb-1 block">
                OCR Settings Preset
              </Label>
              <Select value={ocrPreset} onValueChange={handleOcrPresetChange}>
                <SelectTrigger id="modal-ocr-preset" className="w-full">
                  <SelectValue placeholder="Select OCR preset" />
                </SelectTrigger>
                <SelectContent>
                  {ocrPresets.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      <div>
                        <span className="font-medium">{preset.name}</span>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {currentPreset.description}
              </p>
            </div>
          )}
          
          <div className="relative bg-black flex-1 overflow-hidden">
            {isConfirmationOpen ? (
              <div className="absolute inset-0 z-50 bg-background/95 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 h-[80vh] md:h-[70vh]">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Confirm Vehicle Information</h2>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <div className="font-mono text-lg text-primary break-all">
                        VIN: {detectedVehicle?.vin}
                      </div>
                    </div>
                    {detectedVehicle && (
                      <div className="grid gap-2 text-base">
                        <div><span className="font-semibold">Make:</span> {detectedVehicle.make}</div>
                        <div><span className="font-semibold">Model:</span> {detectedVehicle.model}</div>
                        <div><span className="font-semibold">Year:</span> {detectedVehicle.year}</div>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Is this the correct vehicle information?
                    </p>
                  </div>
                </div>
                <div className="p-6 border-t bg-background/80 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleConfirm(false)}
                    >
                      <XIcon className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                    <Button 
                      onClick={() => handleConfirm(true)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Confirm
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-40">
                  <div className="absolute inset-0 border-2 border-primary rounded-lg" />
                  {/* Center indicator cross */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      {/* Horizontal line */}
                      <div className="absolute w-8 h-[2px] bg-primary/80 left-1/2 -translate-x-1/2"></div>
                      {/* Vertical line */}
                      <div className="absolute h-8 w-[2px] bg-primary/80 top-1/2 -translate-y-1/2"></div>
                      {/* Center dot */}
                      <div className="absolute w-2 h-2 rounded-full bg-[#F2FCE2] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg">
                    <p className="text-white text-center text-sm">
                      Position {scanMode === 'text' ? 'VIN text' : 'barcode'} within frame
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
