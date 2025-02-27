
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
  const isMountedRef = useRef(true);
  const workerInitializedRef = useRef(false);
  
  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as ExtendedTrackCapabilities;
      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !videoRef.current!.dataset.flashOn } as any]
        });
        setIsFlashOn(videoRef.current!.dataset.flashOn !== 'true');
        videoRef.current!.dataset.flashOn = videoRef.current!.dataset.flashOn !== 'true' ? 'true' : 'false';
        addLog(`Flash ${videoRef.current!.dataset.flashOn === 'true' ? 'enabled' : 'disabled'}`);
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

  const cleanVinBarcode = useCallback((scannedText: string): string => {
    let cleaned = scannedText.trim();
    
    if (cleaned.startsWith('I') && cleaned.length === 18) {
      addLog('Detected and removing leading I character from barcode scan');
      cleaned = cleaned.substring(1);
    }
    
    cleaned = cleaned.replace(/\s+/g, '').toUpperCase();
    
    return cleaned;
  }, [addLog]);

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
  }, [addLog]);

  const initializeWorker = useCallback(async () => {
    if (workerInitializedRef.current && workerRef.current) {
      return workerRef.current;
    }

    try {
      addLog('Initializing OCR worker with enhanced settings...');
      
      // Set a timeout to prevent potential hang
      const workerPromise = createWorker();
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Worker initialization timed out')), 10000);
      });
      
      // Race between worker initialization and timeout
      const worker = await Promise.race([workerPromise, timeoutPromise]) as any;
      
      if (!isMountedRef.current) return null;
      
      addLog('Created worker instance, configuring parameters...');
      
      await worker.reinitialize('eng');
      addLog('Worker language set to English');
      
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        preserve_interword_spaces: '0',
        tessedit_min_word_length: 17,
        tessjs_create_word_level_boxes: '1',
        tessjs_create_box: '1',
        debug_file: '/dev/null',
        tessjs_mock_parameter: '1'
      });

      addLog('OCR worker initialized with enhanced settings');
      workerInitializedRef.current = true;
      return worker;
    } catch (error) {
      addLog(`Error initializing OCR worker: ${error}`);
      workerInitializedRef.current = false;
      toast.error("OCR initialization failed. Please refresh and try again.");
      throw error;
    }
  }, [addLog]);

  const stopCamera = useCallback(() => {
    console.log("Stopping camera, cleaning up resources");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current);
      scanningRef.current = undefined;
    }
    
    if (barcodeReaderRef.current) {
      barcodeReaderRef.current.reset();
      barcodeReaderRef.current = null;
    }
    
    setIsScanning(false);
    setIsFlashOn(false);
    
    // Reset the video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [setIsScanning, setIsFlashOn]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return null;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const scanAreaWidth = video.videoWidth * 0.95;
      const scanAreaHeight = (40 / video.clientHeight) * video.videoHeight;
      const startX = (video.videoWidth - scanAreaWidth) / 2;
      const startY = (video.videoHeight - scanAreaHeight) / 2;

      addLog(`Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
      addLog(`Scan area: ${Math.round(scanAreaWidth)}x${Math.round(scanAreaHeight)} px`);
      addLog(`Scan position: ${Math.round(startX)},${Math.round(startY)}`);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scanAreaWidth;
      tempCanvas.height = scanAreaHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        return null;
      }

      tempCtx.drawImage(
        video,
        startX, startY, scanAreaWidth, scanAreaHeight,
        0, 0, scanAreaWidth, scanAreaHeight
      );

      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = scanAreaWidth * 2;
      scaledCanvas.height = scanAreaHeight * 2;
      const scaledCtx = scaledCanvas.getContext('2d');
      
      if (scaledCtx) {
        scaledCtx.imageSmoothingEnabled = false;
        scaledCtx.drawImage(
          tempCanvas,
          0, 0, tempCanvas.width, tempCanvas.height,
          0, 0, scaledCanvas.width, scaledCanvas.height
        );
      }

      return preprocessImage(scaledCanvas);
    } catch (error) {
      addLog(`Error capturing frame: ${error}`);
      return null;
    }
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

  const startOCRScanning = useCallback(async (immediateScanning?: boolean) => {
    const shouldScan = immediateScanning ?? true;

    if (!streamRef.current || !workerRef.current || !shouldScan || !isMountedRef.current) {
      addLog("Cannot start OCR scanning: missing required resources");
      return;
    }

    // Keep track of frame count to add debugging info periodically
    let frameCount = 0;
    
    const scanFrame = async () => {
      if (!isMountedRef.current || !workerRef.current) {
        addLog("Scan stopped: component unmounted or worker terminated");
        return;
      }
      
      try {
        // Increment frame counter
        frameCount++;
        
        // Add periodic debugging info
        if (frameCount % 30 === 0) {
          addLog(`OCR scanning active: processed ${frameCount} frames`);
        }
        
        const frameData = captureFrame();
        if (!frameData) {
          if (shouldScan && isMountedRef.current) {
            scanningRef.current = requestAnimationFrame(scanFrame);
          }
          return;
        }

        // Set a timeout to prevent recognition from hanging
        const recognitionPromise = workerRef.current.recognize(frameData);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('OCR recognition timed out')), 3000);
        });
        
        // Race between recognition and timeout
        const result = await Promise.race([recognitionPromise, timeoutPromise]);
        
        if (!isMountedRef.current) return;
        
        const { data: { text, confidence } } = result;
        
        addLog(`Raw scan result: ${text}`);
        addLog(`Raw confidence: ${confidence}%`);
        
        // If the text is empty or too short, mark as not detected
        if (!text || text.trim().length < 10) {
          setTextDetected(false);
        }
        
        const possibleVins = correctCommonOcrMistakes(text);
        
        let foundValidVin = false;
        
        for (const vin of possibleVins) {
          if (!isMountedRef.current) return;
          
          if (!checkedVinsRef.current.has(vin)) {
            addLog(`Checking new VIN variation: ${vin}`);
            checkedVinsRef.current.add(vin);
            const isValid = await checkVinValidity(vin);
            if (isValid) {
              foundValidVin = true;
              setTextDetected(true);
              break;
            }
          } else {
            addLog(`Skipping already checked VIN: ${vin}`);
          }
        }
        
        if (!foundValidVin && shouldScan && isMountedRef.current) {
          scanningRef.current = requestAnimationFrame(scanFrame);
        }
      } catch (error) {
        addLog(`OCR error: ${error}`);
        setTextDetected(false);
        
        // If we get too many errors, restart the worker
        if (frameCount > 100) {
          addLog("Too many errors, attempting to restart OCR worker");
          frameCount = 0;
          
          if (workerRef.current) {
            try {
              await workerRef.current.terminate();
            } catch (e) {
              addLog(`Error terminating worker: ${e}`);
            }
            workerRef.current = null;
            workerInitializedRef.current = false;
          }
          
          try {
            workerRef.current = await initializeWorker();
            addLog("OCR worker restarted successfully");
          } catch (e) {
            addLog(`Failed to restart OCR worker: ${e}`);
            toast.error("OCR scanning failed. Please try again.");
            return;
          }
        }
        
        if (shouldScan && isMountedRef.current) {
          scanningRef.current = requestAnimationFrame(scanFrame);
        }
      }
    };
    
    // Start the scanning loop
    addLog("Starting OCR scan loop");
    scanningRef.current = requestAnimationFrame(scanFrame);
  }, [addLog, captureFrame, checkVinValidity, correctCommonOcrMistakes, setTextDetected, initializeWorker]);

  const initializeBarcodeScanner = useCallback(async () => {
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
            if (!videoRef.current || !barcodeReaderRef.current || !isMountedRef.current) return;
            
            const resultPromise = barcodeReaderRef.current.decodeOnce(videoRef.current);
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Barcode detection timed out')), 3000);
            });
            
            // Properly type the result from Promise.race
            const result = await Promise.race<Result>([resultPromise, timeoutPromise]);
            
            if (!isMountedRef.current) return;
            
            // Now result is properly typed as Result
            if (result && result.getText) {
              let scannedValue = result.getText();
              addLog(`Raw barcode detected: ${scannedValue}`);
              
              scannedValue = cleanVinBarcode(scannedValue);
              addLog(`Processed barcode: ${scannedValue}`);
              
              setTextDetected(true);
              
              if (validateVIN(scannedValue)) {
                addLog('Valid VIN detected!');
                
                const vehicleInfo = await fetchVehicleInfo(scannedValue);
                if (!isMountedRef.current) return;
                
                if (vehicleInfo) {
                  addLog(`NHTSA validation passed - Valid VIN found!`);
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
            } else {
              setTextDetected(false);
            }
          } catch (error: any) {
            if (error?.name !== 'NotFoundException') {
              addLog(`Barcode scan error: ${error}`);
            }
            setTextDetected(false);
          }
          
          if (isMountedRef.current) {
            requestAnimationFrame(scanLoop);
          }
        };
        
        scanLoop();
      }
    } catch (error) {
      addLog(`Error initializing barcode scanner: ${error}`);
      toast.error("Failed to initialize barcode scanner. Please try again.");
      throw error;
    }
  }, [addLog, cleanVinBarcode, fetchVehicleInfo, setDetectedVehicle, setIsConfirmationView, setTextDetected]);

  const startCamera = useCallback(async () => {
    try {
      isMountedRef.current = true;
      
      // First, ensure any existing camera streams are stopped
      stopCamera();
      
      addLog('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }).catch(async (err) => {
        addLog(`Environment camera error: ${err}. Falling back to default camera...`);
        return await navigator.mediaDevices.getUserMedia({
          video: true
        });
      });
      
      if (!isMountedRef.current) {
        // Component unmounted during camera initialization
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        addLog('Stream acquired, initializing camera...');
        
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as ExtendedTrackCapabilities;
        setHasFlash('torch' in capabilities);
        if ('torch' in capabilities) {
          addLog('Flash capability detected');
        }
        
        const settings = track.getSettings();
        addLog(`Camera: ${settings.facingMode || 'unknown'} facing, resolution: ${settings.width}x${settings.height}`);
        
        addLog('Waiting for video metadata to load...');
        await new Promise<void>((resolve) => {
          if (!videoRef.current) {
            resolve();
            return;
          }
          
          // Handle the case where metadata might already be loaded
          if (videoRef.current.readyState >= 1) {
            resolve();
          } else {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });
        
        if (!isMountedRef.current || !videoRef.current) {
          addLog('Component unmounted during video initialization');
          return;
        }
        
        addLog('Playing video stream...');
        await videoRef.current.play().catch(err => {
          addLog(`Error playing video: ${err}`);
          toast.error("Camera initialization failed. Please check permissions.");
          throw err;
        });
        
        addLog('Video stream started successfully');

        if (scanMode === 'text') {
          addLog('Starting OCR initialization...');
          
          try {
            workerRef.current = await initializeWorker();
            
            if (!isMountedRef.current) {
              addLog('Component unmounted during OCR initialization');
              return;
            }
            
            addLog('OCR worker initialized successfully');
            setIsScanning(true);
            
            addLog('Starting OCR scanning...');
            await startOCRScanning(true);
          } catch (error) {
            addLog(`OCR initialization failed: ${error}`);
            toast.error("Failed to initialize OCR scanner. Please try again.");
          }
        } else {
          addLog('Initializing barcode reader...');
          await initializeBarcodeScanner();
        }
      }
    } catch (error) {
      addLog(`Error accessing camera: ${error}`);
      toast.error("Could not access camera. Please check camera permissions.");
    }
  }, [addLog, initializeBarcodeScanner, initializeWorker, scanMode, setHasFlash, setIsScanning, startOCRScanning, stopCamera]);

  const handleScanModeChange = useCallback(async (value: ScanMode) => {
    addLog(`Switching scan mode to: ${value}`);
    
    // Clean up existing resources before mode change
    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current);
      scanningRef.current = undefined;
    }
    
    if (workerRef.current) {
      addLog('Terminating OCR worker before mode change');
      try {
        await workerRef.current.terminate();
      } catch (e) {
        addLog(`Error terminating worker: ${e}`);
      }
      workerRef.current = null;
      workerInitializedRef.current = false;
    }
    
    if (barcodeReaderRef.current) {
      addLog('Resetting barcode reader before mode change');
      barcodeReaderRef.current.reset();
      barcodeReaderRef.current = null;
    }
    
    // Restart camera with new mode
    stopCamera();
    await startCamera();
  }, [addLog, startCamera, stopCamera]);

  const handleManualVinSubmit = useCallback(async () => {
    // Get the manually entered VIN from the window object (temporary solution due to refactoring)
    const enteredVin = (window as any).tempManualVin || manualVin;
    
    if (enteredVin.trim().length === 17) {
      if (validateVIN(enteredVin)) {
        const processedVin = postProcessVIN(enteredVin);
        const vehicleInfo = await fetchVehicleInfo(processedVin);
        
        if (vehicleInfo) {
          setDetectedVehicle(vehicleInfo);
          setIsConfirmationView(true);
        } else {
          const dummyVehicleInfo = {
            vin: processedVin,
            make: "Unknown",
            model: "Unknown",
            year: "Unknown"
          };
          setDetectedVehicle(dummyVehicleInfo);
          setIsConfirmationView(true);
        }
      } else {
        toast.error("Invalid VIN format");
      }
    } else {
      toast.error("VIN must be 17 characters long");
    }
  }, [fetchVehicleInfo, manualVin, setDetectedVehicle, setIsConfirmationView]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clear any animation frames
      if (scanningRef.current) {
        cancelAnimationFrame(scanningRef.current);
        scanningRef.current = undefined;
      }
      
      // Terminate OCR worker
      if (workerRef.current) {
        workerRef.current.terminate().catch((err: any) => {
          console.error("Error terminating OCR worker:", err);
        });
        workerRef.current = null;
        workerInitializedRef.current = false;
      }
      
      // Stop camera and clean up resources
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
