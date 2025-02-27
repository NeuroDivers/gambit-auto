
import { useState, useRef, useCallback } from "react";
import { ScanMode, VehicleInfo } from "../types";

export const useScannerState = () => {
  const [scanMode, setScanMode] = useState<ScanMode>('text');
  const [logs, setLogs] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const hasFlash = useRef(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [detectedVehicle, setDetectedVehicle] = useState<VehicleInfo | null>(null);
  const [isConfirmationView, setIsConfirmationView] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const textDetected = useRef(false);
  const isFlashingRed = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = useCallback((message: string) => {
    console.log("[VIN Scanner]", message);
    setLogs(prev => [...prev, message]);
  }, []);

  const toggleFlash = useCallback(() => {
    setIsFlashOn(prev => !prev);
  }, []);

  return {
    scanMode,
    setScanMode,
    logs,
    addLog,
    isScanning,
    setIsScanning,
    hasFlash,
    isFlashOn,
    setIsFlashOn,
    toggleFlash,
    detectedVehicle,
    setDetectedVehicle,
    isConfirmationView,
    setIsConfirmationView,
    showLogs,
    setShowLogs,
    textDetected,
    isFlashingRed,
    isLoading,
    setIsLoading
  };
};
