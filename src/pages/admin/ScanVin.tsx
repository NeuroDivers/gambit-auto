
import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Check, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { VehicleInfo } from "@/components/vin-scanner/types"
import { decodeVIN } from "@/components/vin-scanner/utils/vinDecoder"
import ScannerControls from "@/components/vin-scanner/ScannerControls"
import ScannerViewport from "@/components/vin-scanner/ScannerViewport"
import ManualVinEntry from "@/components/vin-scanner/ManualVinEntry"
import LogsViewer from "@/components/vin-scanner/LogsViewer"
import ConfirmationView from "@/components/vin-scanner/ConfirmationView"
import { useScannerState } from "@/components/vin-scanner/hooks/useScannerState"
import { useVinScanner } from "@/components/vin-scanner/hooks/useVinScanner"

export default function ScanVin() {
  console.log("ScanVin component rendered");
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location
  const returnPath = state?.returnPath || "/estimates/create"
  
  const scannerState = useScannerState()
  const {
    scanMode, setScanMode,
    logs, addLog,
    isScanning, setIsScanning,
    hasFlash, isFlashOn, setIsFlashOn, toggleFlash,
    detectedVehicle, setDetectedVehicle,
    isConfirmationView, setIsConfirmationView,
    showLogs, setShowLogs,
    textDetected, isFlashingRed,
    isLoading, setIsLoading
  } = scannerState
  
  const scanner = useVinScanner({
    scanMode, 
    setIsScanning, 
    addLog, 
    setTextDetected: (val) => textDetected.current = val,
    setIsFlashOn,
    setHasFlash: (val) => hasFlash.current = val,
    setDetectedVehicle,
    setIsConfirmationView,
    setIsLoading
  })
  
  const {
    videoRef, 
    canvasRef,
    startCamera,
    stopCamera,
    handleScanModeChange,
    handleManualVinSubmit,
    logsEndRef
  } = scanner
  
  // Use a ref to track if the camera is already initialized
  const isCameraInitializedRef = useRef(false)
  // Track mount state to prevent effects after unmount
  const isMountedRef = useRef(false)
  
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Only start the camera on the initial mount
    if (!isCameraInitializedRef.current) {
      console.log("Starting camera on first mount");
      isCameraInitializedRef.current = true;
      
      // Small delay to ensure component is fully rendered before starting camera
      const initTimer = setTimeout(() => {
        if (isMountedRef.current) {
          startCamera();
        }
      }, 100);
      
      return () => {
        clearTimeout(initTimer);
      };
    }
    
    // Clean up on unmount
    return () => {
      console.log("Stopping camera on unmount");
      isMountedRef.current = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

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
    
    if (!videoRef.current?.srcObject) {
      startCamera()
    } else {
      setIsScanning(true)
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
        <ConfirmationView 
          detectedVehicle={detectedVehicle}
          isLoading={isLoading}
          vinDetails={vinDetails}
          onTryAgain={handleTryAgain}
          onConfirm={handleConfirm}
        />
      ) : (
        <div className="space-y-4">
          <ScannerControls 
            scanMode={scanMode}
            handleScanModeChange={handleScanModeChange}
            showLogs={showLogs}
            setShowLogs={setShowLogs}
          />

          <p className="text-xs text-muted-foreground">Using preset: Default OCR Settings</p>

          <ScannerViewport 
            videoRef={videoRef}
            canvasRef={canvasRef}
            detectedVehicle={detectedVehicle}
            isFlashingRed={isFlashingRed}
            textDetected={textDetected.current}
          />

          <ManualVinEntry 
            handleManualVinSubmit={handleManualVinSubmit}
          />

          {hasFlash.current && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFlash}
              >
                Flash {isFlashOn ? "Off" : "On"}
              </Button>
            </div>
          )}

          {showLogs && (
            <LogsViewer logs={logs} logsEndRef={logsEndRef} />
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
