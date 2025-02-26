import { useState, useRef, useEffect } from "react"
import { createWorker, PSM } from 'tesseract.js'
import { toast } from "sonner"
import { validateVIN, validateVinWithNHTSA } from "@/utils/vin-validation"
import { preprocessImage, cropToVinRegion, postProcessVIN, BoundingBox } from '../utils/imageProcessing'

interface UseVinScannerProps {
  onScan: (vin: string) => void
  onClose: () => void
}

export interface ExtendedTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean
}

const loadOpenCV = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    window.cv = undefined;
  }

  const existingScript = document.querySelector('script[src*="opencv.js"]');
  if (existingScript) {
    existingScript.remove();
  }

  return new Promise((resolve, reject) => {
    let isResolved = false;

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.5.4/opencv.js';
    script.async = true;
    script.type = 'text/javascript';

    const checkOpenCVModule = () => {
      if (window.cv && typeof window.cv === 'object') {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      }
    };

    script.onload = () => {
      const cvCheckInterval = setInterval(() => {
        checkOpenCVModule();
        if (isResolved) {
          clearInterval(cvCheckInterval);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(cvCheckInterval);
        if (!isResolved) {
          reject(new Error('OpenCV took too long to initialize'));
        }
      }, 10000);
    };

    script.onerror = () => {
      reject(new Error('Failed to load OpenCV'));
    };

    // Set up the Module callback that OpenCV will use
    if (typeof window !== 'undefined') {
      window.Module = {
        onRuntimeInitialized: () => {
          checkOpenCVModule();
        }
      };
    }

    document.body.appendChild(script);
  });
};

export const useVinScanner = ({ onScan, onClose }: UseVinScannerProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [hasFlash, setHasFlash] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [detectedRegion, setDetectedRegion] = useState<BoundingBox | null>(null)
  const [isOpenCVLoaded, setIsOpenCVLoaded] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<any>(null)
  const scanningRef = useRef<number>()
  const logsEndRef = useRef<HTMLDivElement>(null)
  const isProcessingRef = useRef(false)
  const lastScanTimeRef = useRef<number>(0);
  const SCAN_INTERVAL = 500;
  const CONFIDENCE_THRESHOLD = 0; // Lower confidence threshold since we're getting good matches with low confidence
  const MIN_MATCHES_REQUIRED = 2;
  const matchesRef = useRef<{[key: string]: number}>({});
  const scanStartTimeRef = useRef<number>(0);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  const captureFrame = async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current || !window.cv) {
      addLog('Video, canvas or OpenCV not available');
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      addLog('Video not ready or context not available');
      return null;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      addLog('Frame captured successfully');
      
      const { processedImage, boundingBox } = await preprocessImage(imageData);
      setDetectedRegion(boundingBox);
      
      if (boundingBox) {
        const croppedRegion = cropToVinRegion(canvas, boundingBox);
        if (croppedRegion) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = croppedRegion.width;
          tempCanvas.height = croppedRegion.height;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.putImageData(croppedRegion, 0, 0);
            addLog('VIN region detected and cropped');
            return tempCanvas.toDataURL();
          }
        }
      }
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = processedImage.width;
      tempCanvas.height = processedImage.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.putImageData(processedImage, 0, 0);
        addLog('Frame processed successfully');
        return tempCanvas.toDataURL();
      }
      
      addLog('Using full frame for scanning');
      return canvas.toDataURL();
    } catch (error) {
      console.error('Error in captureFrame:', error);
      addLog(`Frame capture error: ${error}`);
      return null;
    }
  }

  const startOCRScanning = async () => {
    if (!scanStartTimeRef.current) {
      scanStartTimeRef.current = Date.now();
    }

    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current);
      scanningRef.current = undefined;
    }

    const currentTime = Date.now();
    if (currentTime - lastScanTimeRef.current < SCAN_INTERVAL) {
      scanningRef.current = requestAnimationFrame(startOCRScanning);
      return;
    }

    if (isProcessingRef.current || isPaused || !isOpenCVLoaded) {
      addLog('Scanning skipped: ' + 
        (isProcessingRef.current ? 'processing in progress' : 
         isPaused ? 'scanning paused' : 
         'OpenCV not loaded'));
      
      if (!isPaused) {
        scanningRef.current = requestAnimationFrame(startOCRScanning);
      }
      return;
    }

    if (!streamRef.current || !workerRef.current) {
      addLog('Scanning conditions not met:')
      addLog(`- Stream available: ${!!streamRef.current}`)
      addLog(`- Worker available: ${!!workerRef.current}`)
      addLog(`- OpenCV loaded: ${isOpenCVLoaded}`)
      return;
    }

    try {
      isProcessingRef.current = true;
      lastScanTimeRef.current = currentTime;
      
      const frameData = await captureFrame();
      if (!frameData) {
        isProcessingRef.current = false;
        if (!isPaused) {
          scanningRef.current = requestAnimationFrame(startOCRScanning);
        }
        return;
      }

      const result = await workerRef.current.recognize(frameData);
      const { text, confidence } = result.data;
      
      // Extract VIN pattern first
      const vinPattern = /[A-HJ-NPR-Z0-9]{17}/;
      const matches = text.match(vinPattern);
      
      if (matches) {
        const potentialVin = matches[0];
        addLog(`VIN pattern found: "${potentialVin}" (${confidence.toFixed(1)}%)`);
        
        if (validateVIN(potentialVin)) {
          const isNorthAmerican = ['1', '2', '3', '4', '5'].includes(potentialVin[0]);
          addLog(`✓ Valid VIN format detected${isNorthAmerican ? ' (North American)' : ''}`);
          
          // Increment match count for this VIN
          matchesRef.current[potentialVin] = (matchesRef.current[potentialVin] || 0) + 1;
          
          if (matchesRef.current[potentialVin] >= MIN_MATCHES_REQUIRED) {
            const isValidVin = await validateVinWithNHTSA(potentialVin);
            if (isValidVin) {
              const scanDuration = (Date.now() - scanStartTimeRef.current) / 1000;
              addLog(`✓ VIN validated successfully! (Scan took ${scanDuration.toFixed(1)} seconds)`);
              toast.success(`VIN scanned and validated successfully in ${scanDuration.toFixed(1)}s`);
              onScan(potentialVin);
              onClose();
              return;
            }
          }
        }
      } else if (text.trim()) {
        addLog(`Raw text: "${text.trim()}" (${confidence.toFixed(1)}%)`);
      }

      isProcessingRef.current = false;
      if (!isPaused) {
        scanningRef.current = requestAnimationFrame(startOCRScanning);
      }
    } catch (error) {
      console.error('OCR error:', error);
      addLog(`OCR error: ${error}`);
      isProcessingRef.current = false;
      if (!isPaused) {
        setTimeout(() => {
          scanningRef.current = requestAnimationFrame(startOCRScanning);
        }, 1000);
      }
    }
  };

  const startCamera = async () => {
    try {
      await stopCamera();
      
      // Initialize everything before starting the camera
      addLog('Loading OpenCV...');
      try {
        await loadOpenCV();
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsOpenCVLoaded(true);
        addLog('OpenCV loaded and initialized successfully');
      } catch (error) {
        console.error('OpenCV loading error:', error);
        addLog(`Failed to load OpenCV: ${error}`);
        toast.error("Failed to initialize camera. Please try again.");
        onClose();
        return;
      }

      if (!window.cv) {
        throw new Error('OpenCV failed to initialize properly');
      }

      // Reset timer when starting camera
      scanStartTimeRef.current = Date.now();

      // Initialize worker before camera
      addLog('Initializing OCR worker...');
      workerRef.current = await initializeWorker();

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
      
      if (isOpenCVLoaded && workerRef.current) {
        addLog('Starting OCR scanning loop...');
        startOCRScanning();
      } else {
        throw new Error('Required components not initialized');
      }
    } catch (error) {
      console.error('Camera start error:', error);
      addLog(`Error accessing camera: ${error}`);
      toast.error("Could not access camera. Please check camera permissions.");
      onClose();
    }
  };

  const stopCamera = async () => {
    if (scanningRef.current) {
      cancelAnimationFrame(scanningRef.current);
      scanningRef.current = undefined;
    }

    scanStartTimeRef.current = 0; // Reset the timer when stopping camera

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
    setIsOpenCVLoaded(false)
    addLog('Camera and scanning stopped')
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
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '0',
        tessjs_create_box: '1',
        tessjs_create_unlock: '1',
        tessjs_min_char_height: '20',
        textord_min_linesize: '2.5',
        classify_bln_numeric_mode: '1'
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

  const togglePause = () => {
    setIsPaused(prev => {
      const newPauseState = !prev;
      addLog(`Scanning ${newPauseState ? 'paused' : 'resumed'}`);
      
      if (!newPauseState && !scanningRef.current) {
        scanningRef.current = requestAnimationFrame(startOCRScanning);
      }
      
      return newPauseState;
    });
  }

  useEffect(() => {
    return () => {
      if (scanningRef.current) {
        cancelAnimationFrame(scanningRef.current);
        scanningRef.current = undefined;
      }
      stopCamera();
    };
  }, []);

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
    stopCamera,
    detectedRegion
  }
}
