
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
  
  // Using a direct scanner instance configuration, not dependent on hooks
  const scannerRef = useRef(null)
  const startCameraRef = useRef(null)
  const stopCameraRef = useRef(null)
  
  // Single initialization of the scanner
  if (scannerRef.current === null) {
    console.log("Initializing VIN scanner")
    
    const config = {
      scanMode, 
      setIsScanning, 
      addLog, 
      setTextDetected: (val) => { 
        if (textDetected && textDetected.current !== undefined) {
          textDetected.current = val
        }
      },
      setIsFlashOn,
      setHasFlash: (val) => { 
        if (hasFlash && hasFlash.current !== undefined) {
          hasFlash.current = val
        }
      },
      setDetectedVehicle,
      setIsConfirmationView,
      setIsLoading
    }
    
    const scanner = useVinScanner(config)
    scannerRef.current = scanner
    
    // Store functions in refs for stable reference
    if (scanner) {
      startCameraRef.current = scanner.startCamera
      stopCameraRef.current = scanner.stopCamera
    }
  }
  
  const scanner = scannerRef.current || {}
  
  const {
    videoRef, 
    canvasRef,
    handleScanModeChange,
    handleManualVinSubmit,
    logsEndRef
  } = scanner
  
  // Safe function references
  const startCamera = startCameraRef.current
  const stopCamera = stopCameraRef.current
  
  // Initialization flag
  const hasInitializedRef = useRef(false)
  
  // Single useEffect for initialization and cleanup
  useEffect(() => {
    console.log("ScanVin mount effect running")
    
    // Only start the camera on first mount
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      console.log("Starting camera on first mount")
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (typeof startCamera === 'function') {
          startCamera()
        }
      }, 500)
      
      // Return cleanup function
      return () => {
        clearTimeout(timer)
        console.log("Cleanup effect running - stopping camera")
        if (typeof stopCamera === 'function') {
          stopCamera()
        }
      }
    }
    
    // Cleanup only if we're already initialized
    return () => {
      console.log("Cleanup effect running - stopping camera")
      if (typeof stopCamera === 'function') {
        stopCamera()
      }
    }
  // Intentionally empty dependency array - we're using refs for stability
  }, [])

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
    
    if (!videoRef?.current?.srcObject) {
      if (typeof startCamera === 'function') {
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
            textDetected={textDetected?.current}
          />

          <ManualVinEntry 
            handleManualVinSubmit={handleManualVinSubmit}
          />

          {hasFlash?.current && (
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
