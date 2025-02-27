
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
  
  // Create a stable reference to scanner config
  const scannerConfigRef = useRef({
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

  // Update config ref when dependencies change
  useEffect(() => {
    scannerConfigRef.current = {
      scanMode, 
      setIsScanning, 
      addLog, 
      setTextDetected: (val) => textDetected.current = val,
      setIsFlashOn,
      setHasFlash: (val) => hasFlash.current = val,
      setDetectedVehicle,
      setIsConfirmationView,
      setIsLoading
    }
  }, [
    scanMode, 
    setIsScanning, 
    addLog, 
    textDetected, 
    setIsFlashOn, 
    hasFlash, 
    setDetectedVehicle, 
    setIsConfirmationView, 
    setIsLoading
  ])
  
  // Create a stable reference to avoid recreating the scanner on re-renders
  const scannerRef = useRef(null)
  
  // Initialize scanner only once using the config ref
  if (!scannerRef.current) {
    scannerRef.current = useVinScanner(scannerConfigRef.current)
  }
  
  const scanner = scannerRef.current
  
  const {
    videoRef, 
    canvasRef,
    startCamera,
    stopCamera,
    handleScanModeChange,
    handleManualVinSubmit,
    logsEndRef
  } = scanner
  
  // Initialization flag
  const hasInitializedRef = useRef(false)
  
  // Safe camera initialization effect
  useEffect(() => {
    console.log("ScanVin mount effect running")
    
    // Only start the camera on first mount
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      console.log("Starting camera on first mount")
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (startCamera && typeof startCamera === 'function') {
          startCamera()
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, []) // Empty dependency array since we're using refs
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log("Cleanup effect running - stopping camera")
      if (stopCamera && typeof stopCamera === 'function') {
        stopCamera()
      }
    }
  }, []) // Empty dependency array since we're using refs

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
      if (startCamera && typeof startCamera === 'function') {
        startCamera()
      }
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
