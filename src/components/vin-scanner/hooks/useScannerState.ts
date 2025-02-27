
import { useState, useRef, useEffect } from "react";
import { VehicleInfo, ScanMode } from "../types";

export const useScannerState = () => {
  // Scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('text');
  const [logs, setLogs] = useState<string[]>([]);
  const hasFlash = useRef(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scanStartTime, setScanStartTime] = useState<Date | null>(null);
  const [lastScanDuration, setLastScanDuration] = useState<number | null>(null);
  const [detectedVehicle, setDetectedVehicle] = useState<VehicleInfo | null>(null);
  const [isConfirmationView, setIsConfirmationView] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textDetected = useRef(false);
  const [isFlashingRed, setIsFlashingRed] = useState(false);
  
  const flashingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (message: string) => {
    if (!isPaused) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        type: 'vin-scanner'
      };
      
      setLogs(prev => [...prev, message]);
      
      const existingLogs = JSON.parse(localStorage.getItem('scanner-logs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('scanner-logs', JSON.stringify(existingLogs.slice(-1000)));
    }
  };

  // Set up the flashing border effect
  useEffect(() => {
    if (flashingIntervalRef.current) {
      clearInterval(flashingIntervalRef.current);
    }

    if (!textDetected.current && isScanning && !isConfirmationView) {
      // Start flashing the border when no text is detected
      flashingIntervalRef.current = setInterval(() => {
        setIsFlashingRed(prevState => !prevState);
      }, 500); // Flash every 500ms
    } else {
      // Reset flashing state when text is detected
      setIsFlashingRed(false);
    }

    return () => {
      if (flashingIntervalRef.current) {
        clearInterval(flashingIntervalRef.current);
      }
    };
  }, [textDetected.current, isScanning, isConfirmationView]);

  const toggleFlash = async () => {
    // This is a placeholder. The actual implementation is in useVinScanner
    setIsFlashOn(!isFlashOn);
  };

  return {
    isCameraActive, setIsCameraActive,
    isScanning, setIsScanning,
    scanMode, setScanMode,
    logs, setLogs, addLog,
    hasFlash, 
    isFlashOn, setIsFlashOn, toggleFlash,
    isPaused, setIsPaused,
    scanStartTime, setScanStartTime,
    lastScanDuration, setLastScanDuration,
    detectedVehicle, setDetectedVehicle,
    isConfirmationView, setIsConfirmationView,
    showLogs, setShowLogs,
    isLoading, setIsLoading,
    textDetected, 
    isFlashingRed, setIsFlashingRed,
    flashingIntervalRef
  };
};
