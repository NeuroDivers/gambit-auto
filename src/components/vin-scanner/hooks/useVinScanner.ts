
import { useState, useRef, useCallback, useEffect } from "react";
import { createWorker, PSM } from 'tesseract.js';
import { BrowserMultiFormatReader, BarcodeFormat, Result } from '@zxing/library';
import { toast } from "sonner";
import { preprocessImage } from "@/utils/image-processing";
import { validateVIN, postProcessVIN, validateVinWithNHTSA } from "@/utils/vin-validation";
import { VehicleInfo, ExtendedTrackCapabilities, ScanMode, VinScannerProps } from "../types";

export const useVinScanner = ({
  scanMode, 
  setIsScanning, 
  addLog, 
  setTextDetected,
  setIsFlashOn,
  setHasFlash,
  setDetectedVehicle,
  setIsConfirmationView,
  setIsLoading
}: VinScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<any>(null);
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef<number>();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const checkedVinsRef = useRef<Set<string>>(new Set());
  const [manualVin, setManualVin] = useState("");
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedTrackCapabilities;
      if ('torch' in capabilities) {
        const newFlashState = !videoRef.current!.dataset.flashOn;
        await track.applyConstraints({
          advanced: [{ torch: newFlashState } as any]
        });
        setIsFlashOn(newFlashState);
        videoRef.current!.dataset.flashOn = newFlashState ? 'true' : 'false';
        addLog(`Flash ${newFlashState ? 'enabled' : 'disabled'}`);
      }
    } catch (err) {
      addLog(`Flash control error: ${err}`);
      toast.error('Failed to toggle flash');
    }
  }, [setIsFlashOn, addLog]);

  const correctCommonOcrMistakes = useCallback((text: string): string[] => {
    let cleanText = text
      .replace(/\s+/g, '')
      .toUpperCase();
    
    addLog(`Initial cleaned text: ${cleanText}`);

    // Set textDetected to true if we have some substantial text content
    setTextDetected(cleanText.length >= 10);

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
  }, [addLog, setTextDetected]);

  const generateVinVariations = useCallback((text: string): string[] => {
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
      };
      
      return checkDigitMappings[char] || '0';
    };

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
    
    // Only log a subset of variations to avoid overwhelming logs
    if (variations.length > 10) {
      addLog(`First 10 of ${variations.length} variations: ${variations.slice(0, 10).join(', ')}`);
    } else {
      variations.forEach((variant, index) => {
        addLog(`Variation ${index + 1}: ${variant}`);
      });
    }
    
    const validVariations = variations.filter(v => {
      const isValidFormat = vinPattern.test(v);
      const hasValidCheckDigit = v.length >= 9 && /[0-9X]/.test(v[8]);
      return isValidFormat && hasValidCheckDigit;
    });

    addLog(`Found ${validVariations.length} valid VIN pattern matches`);
    
    return validVariations;
  }, [addLog]);

  const cleanVinBarcode = useCallback((scannedText: string): string => {
    let cleaned = scannedText.trim();
    
    if (cleaned.startsWith('I') && cleaned.length === 18) {
      addLog('Detected and removing leading I character from barcode scan');
      cleaned = cleaned.substring(1);
    }
    
    cleaned = cleaned.replace(/\s+/g, '').toUpperCase();
    
    return cleaned;
  }, [addLog]);

  const fetchVehicleInfo = useCallback(async (vin: string): Promise<VehicleInfo | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const results = data.Results;

      if (!Array.isArray(results)) return null;

      const makeResult = results.find((r: any) => r.Variable === 'Make' && r.Value);
      const modelResult = results.find((r: any) => r.Variable === 'Model' && r.Value);
      const yearResult = results.find((r: any) => r.Variable === 'Model Year' && r.Value);

      if (makeResult?.Value && modelResult?.Value && yearResult?.Value) {
        return {
          vin,
          make: makeResult.Value,
          model: modelResult.Value,
          year: yearResult.Value
        };
      }
    } catch (error) {
      addLog(`NHTSA API error: ${error}`);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [setIsLoading, addLog]);

  const checkVinValidity = useCallback(async (vin: string) => {
    addLog(`Checking possible VIN: ${vin}`);
    
    if (validateVIN(vin)) {
      addLog('Local VIN validation passed');
      const vehicleInfo = await fetchVehicleInfo(vin);
      
      if (vehicleInfo) {
        addLog(`NHTSA validation passed - Valid VIN found!`);
        addLog(`Vehicle Info - Make: ${vehicleInfo.make}, Model: ${vehicleInfo.model}, Year: ${vehicleInfo.year}`);
        
        setDetectedVehicle(vehicleInfo);
        setIsConfirmationView(true);
        return true;
      } else {
        addLog('NHTSA validation failed - Could not decode vehicle info');
      }
    } else {
      addLog(`Local VIN validation failed - Invalid format`);
    }
    return false;
  }, [addLog, fetchVehicleInfo, setDetectedVehicle, setIsConfirmationView]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return null;
    }
    
    // Video must be playing and have valid dimensions
    if (video.paused || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const scanAreaWidth = video.videoWidth * 0.95;
      const scanAreaHeight = (40 / Math.max(video.clientHeight, 1)) * video.videoHeight;
      const startX = (video.videoWidth - scanAreaWidth) / 2;
      const startY = (video.videoHeight - scanAreaHeight) / 2;

      // Only log dimensions occasionally to avoid filling logs
      if (Math.random() < 0.01) {  // 1% chance to log
        addLog(`Capture: ${video.videoWidth}x${video.videoHeight}`);
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scanAreaWidth;
      tempCanvas.height = scanAreaHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        return null;
      }

      // Draw video frame to temp canvas
      tempCtx.drawImage(
        video,
        startX, startY, scanAreaWidth, scanAreaHeight,
        0, 0, scanAreaWidth, scanAreaHeight
      );

      // Process the image to enhance text detection
      return preprocessImage(tempCanvas);
    } catch (error) {
      addLog(`Error capturing frame: ${error}`);
      return null;
    }
  }, [addLog]);

  const initializeWorker = useCallback(async () => {
    try {
      addLog('Initializing OCR worker...');
      const worker = await createWorker();
      
      await worker.reinitialize('eng');
      addLog('Worker language set to English');
      
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        preserve_interword_spaces: '0',
        tessedit_min_word_length: 17
      });

      addLog('OCR worker initialized with enhanced settings');
      return worker;
    } catch (error) {
      addLog(`Error initializing OCR worker: ${error}`);
      toast.error("OCR initialization failed. Please refresh and try again.");
      throw error;
    }
  }, [addLog]);

  const startOCRScanning = useCallback(async () => {
    // Don't start if already scanning
    if (scanningRef.current) {
      return;
    }
    
    // Ensure we have a worker
    if (!workerRef.current) {
      try {
        workerRef.current = await initializeWorker();
      } catch (err) {
        addLog(`Failed to initialize worker: ${err}`);
        return;
      }
    }
    
    // Check if video is playing
    if (!videoRef.current || videoRef.current.paused) {
      try {
        if (videoRef.current) {
          await videoRef.current.play();
          addLog('Video started from OCR scanner');
        }
      } catch (err) {
        addLog(`Failed to start video: ${err}`);
      }
    }
    
    addLog(`Starting OCR scan loop - video state: ${videoRef.current?.paused ? 'paused' : 'playing'}`);
    setIsScanning(true);
    
    // Frame counter for debugging
    let frameCount = 0;
    
    const scanFrame = async () => {
      if (!isMountedRef.current) {
        addLog("Component unmounted, stopping scan");
        return;
      }
      
      frameCount++;
      
      if (frameCount % 30 === 0) {
        addLog(`Processed ${frameCount} frames`);
      }
      
      try {
        const frameData = captureFrame();
        if (!frameData) {
          // Schedule next frame and continue
          scanningRef.current = requestAnimationFrame(scanFrame);
          return;
        }

        // Process the frame with OCR
        const result = await workerRef.current.recognize(frameData);
        
        if (!isMountedRef.current) return;
        
        const { data: { text, confidence } } = result;
        
        if (text && text.length > 3) {
          addLog(`Raw text: ${text} (${confidence.toFixed(1)}%)`);
          
          // Process the detected text
          const possibleVins = correctCommonOcrMistakes(text);
          
          // Check if any of the variations is a valid VIN
          for (const vin of possibleVins) {
            if (!isMountedRef.current) return;
            
            if (!checkedVinsRef.current.has(vin)) {
              checkedVinsRef.current.add(vin);
              
              // Check if this might be a valid VIN
              const isValid = await checkVinValidity(vin);
              if (isValid) {
                // Valid VIN found - stop scanning
                return;
              }
            }
          }
        }
      } catch (error) {
        // Ignore common errors to reduce log noise
        if (String(error).includes('Not enough data')) {
          // This is a common OCR error, don't log
        } else {
          addLog(`OCR error: ${error}`);
        }
      }
      
      // Continue scanning if component is still mounted
      if (isMountedRef.current) {
        scanningRef.current = requestAnimationFrame(scanFrame);
      }
    };
    
    // Start the scan loop
    scanningRef.current = requestAnimationFrame(scanFrame);
  }, [addLog, captureFrame, checkVinValidity, correctCommonOcrMistakes, initializeWorker, setIsScanning]);

  const initializeBarcodeScanner = useCallback(async () => {
    try {
      const hints = new Map();
      const formats = [BarcodeFormat.CODE_39, BarcodeFormat.DATA_MATRIX, BarcodeFormat.CODE_128];
      hints.set(2, formats); // Format hints
      
      const codeReader = new BrowserMultiFormatReader(hints);
      barcodeReaderRef.current = codeReader;

      if (videoRef.current) {
        addLog('Starting barcode scanning...');
        
        const scanLoop = async () => {
          try {
            if (!videoRef.current || !barcodeReaderRef.current || !isMountedRef.current) return;
            
            // Try to decode a barcode from the current video frame
            // Use decodeFromVideoElement instead of decodeOnceFromVideoElement
            const result = await barcodeReaderRef.current.decodeFromVideoElement(videoRef.current);
            
            if (!isMountedRef.current) return;
            
            if (result && result.getText()) {
              const scannedText = result.getText();
              addLog(`Barcode detected: ${scannedText}`);
              
              // Process the barcode text
              const cleanedVin = cleanVinBarcode(scannedText);
              
              // Check if it's a valid VIN
              if (validateVIN(cleanedVin)) {
                addLog('Valid VIN barcode detected!');
                
                // Get vehicle info
                const vehicleInfo = await fetchVehicleInfo(cleanedVin);
                
                if (vehicleInfo) {
                  addLog(`Vehicle info found: ${vehicleInfo.make} ${vehicleInfo.model} ${vehicleInfo.year}`);
                  setDetectedVehicle(vehicleInfo);
                  setIsConfirmationView(true);
                  return;
                } else {
                  // VIN format is valid but no info found
                  addLog('VIN format valid but no vehicle info found');
                  setDetectedVehicle({
                    vin: cleanedVin,
                    make: "Unknown",
                    model: "Unknown",
                    year: "Unknown"
                  });
                  setIsConfirmationView(true);
                  return;
                }
              } else {
                addLog(`Invalid VIN format: ${cleanedVin}`);
              }
            }
          } catch (error: any) {
            // Ignore not found errors to reduce log noise
            if (error?.name !== 'NotFoundException') {
              addLog(`Barcode scan error: ${error}`);
            }
          }
          
          // Continue scanning if component is still mounted
          if (isMountedRef.current) {
            requestAnimationFrame(scanLoop);
          }
        };
        
        // Start the scan loop
        scanLoop();
      }
    } catch (error) {
      addLog(`Error initializing barcode scanner: ${error}`);
      toast.error("Failed to initialize barcode scanner. Please try again.");
    }
  }, [addLog, cleanVinBarcode, fetchVehicleInfo, setDetectedVehicle, setIsConfirmationView]);

  const stopCamera = useCallback(() => {
    addLog("Stopping camera");
    
    // Stop scanning
    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current);
      scanningRef.current = undefined;
    }
    
    // Reset barcode reader
    if (barcodeReaderRef.current) {
      barcodeReaderRef.current.reset();
      barcodeReaderRef.current = null;
    }
    
    // Update state
    setIsScanning(false);
    setIsFlashOn(false);
    
    // Stop video playback
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    
    // Stop all camera tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error("Error stopping track:", e);
        }
      });
      streamRef.current = null;
    }
    
    // Mark as uninitialized
    isInitializedRef.current = false;
  }, [addLog, setIsFlashOn, setIsScanning]);

  const startCamera = useCallback(async () => {
    // Only initialize once
    if (isInitializedRef.current) {
      addLog("Camera already initialized");
      return;
    }
    
    try {
      addLog('Starting camera initialization...');
      isMountedRef.current = true;
      
      // Stop any existing camera stream
      stopCamera();
      
      // Request camera access with low resolution first
      addLog('Requesting camera access...');
      
      let stream: MediaStream;
      try {
        // Try to get environment-facing camera first (typically back camera on phones)
        addLog('Attempting to access environment-facing camera...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
        addLog('Successfully accessed environment-facing camera');
      } catch (envError) {
        // Fall back to any available camera
        addLog(`Could not access environment camera: ${envError}. Falling back to default camera.`);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
        addLog('Successfully accessed default camera');
      }
      
      if (!isMountedRef.current) {
        // Component unmounted during initialization
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      if (!videoRef.current) {
        addLog('Video element not found');
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      // Store the stream for later cleanup
      streamRef.current = stream;
      
      // Check for flash capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities() as ExtendedTrackCapabilities;
        const hasFlashCapability = 'torch' in capabilities;
        setHasFlash(hasFlashCapability);
        
        if (hasFlashCapability) {
          addLog('Flash capability detected');
        }
        
        const settings = videoTrack.getSettings();
        addLog(`Camera: ${settings.facingMode || 'unknown'} facing, resolution: ${settings.width}x${settings.height}`);
      }
      
      // Set up the video element
      addLog('Setting up video element...');
      
      // Prepare video element for playback
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = true;
      
      // Mark as initialized
      isInitializedRef.current = true;
      
      // Initialize the appropriate scanner based on mode
      if (scanMode === 'text') {
        addLog('Starting OCR initialization...');
        workerRef.current = await initializeWorker();
        addLog('OCR worker initialized successfully');
        
        // Start OCR scanning after a brief delay
        setTimeout(() => {
          if (isMountedRef.current) {
            startOCRScanning();
          }
        }, 500);
      } else {
        addLog('Initializing barcode scanner...');
        await initializeBarcodeScanner();
      }
    } catch (error) {
      addLog(`Error accessing camera: ${error}`);
      toast.error("Could not access camera. Please check camera permissions.");
    }
  }, [
    addLog, 
    initializeBarcodeScanner, 
    initializeWorker, 
    scanMode, 
    setHasFlash, 
    startOCRScanning, 
    stopCamera
  ]);

  const handleScanModeChange = useCallback(async (value: ScanMode) => {
    addLog(`Switching scan mode to: ${value}`);
    
    // Clean up existing resources
    stopCamera();
    
    // Terminate worker if it exists
    if (workerRef.current) {
      try {
        await workerRef.current.terminate();
        workerRef.current = null;
      } catch (e) {
        addLog(`Error terminating worker: ${e}`);
      }
    }
    
    // Wait a moment for resources to clean up
    setTimeout(() => {
      // Restart camera with new mode
      startCamera();
    }, 300);
  }, [addLog, startCamera, stopCamera]);

  const handleManualVinSubmit = useCallback(async () => {
    const enteredVin = (window as any).tempManualVin || manualVin;
    
    if (!enteredVin || enteredVin.trim().length !== 17) {
      toast.error("VIN must be 17 characters long");
      return;
    }
    
    if (validateVIN(enteredVin)) {
      // Process the VIN
      const processedVin = postProcessVIN(enteredVin);
      
      // Get vehicle info
      const vehicleInfo = await fetchVehicleInfo(processedVin);
      
      if (vehicleInfo) {
        setDetectedVehicle(vehicleInfo);
        setIsConfirmationView(true);
      } else {
        // Valid VIN format but no info found
        setDetectedVehicle({
          vin: processedVin,
          make: "Unknown",
          model: "Unknown",
          year: "Unknown"
        });
        setIsConfirmationView(true);
      }
    } else {
      toast.error("Invalid VIN format");
    }
  }, [fetchVehicleInfo, manualVin, setDetectedVehicle, setIsConfirmationView]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clean up resources
      if (scanningRef.current) {
        cancelAnimationFrame(scanningRef.current);
      }
      
      if (workerRef.current) {
        workerRef.current.terminate().catch((err: any) => {
          console.error("Error terminating OCR worker:", err);
        });
      }
      
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    logsEndRef,
    startCamera,
    stopCamera,
    handleScanModeChange,
    manualVin,
    setManualVin,
    handleManualVinSubmit,
    toggleFlash
  };
};
