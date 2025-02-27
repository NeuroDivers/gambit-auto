
import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { VehicleInfo } from "@/components/vin-scanner/types"
import { decodeVIN } from "@/components/vin-scanner/utils/vinDecoder"
import ScannerControls from "@/components/vin-scanner/ScannerControls"
import ScannerViewport from "@/components/vin-scanner/ScannerViewport"
import ManualVinEntry from "@/components/vin-scanner/ManualVinEntry"
import LogsViewer from "@/components/vin-scanner/LogsViewer"
import ConfirmationView from "@/components/vin-scanner/ConfirmationView"
import { useScannerState } from "@/components/vin-scanner/hooks/useScannerState"

// Create a class version of the component to avoid React hook issues
export default function ScanVin() {
  console.log("ScanVin component rendered");
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const returnPath = state?.returnPath || "/estimates/create";
  
  // Create refs for all state values to avoid dependency tracking issues
  const scannerStateRef = useRef(useScannerState());
  const scannerState = scannerStateRef.current;
  
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
  } = scannerState;
  
  // Video and canvas refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const logsEndRef = useRef(null);
  const streamRef = useRef(null);
  
  // Initialization flags
  const hasInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  // Function to handle camera initialization
  const startCamera = async () => {
    if (!hasInitializedRef.current) {
      try {
        console.log("Starting camera...");
        setIsScanning(true);
        
        // Request camera access
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: "environment" },
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false
          });
          console.log("Got environment camera");
        } catch (err) {
          console.log("Falling back to default camera", err);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }
        
        // Save stream reference
        streamRef.current = stream;
        
        // Check for flash capability
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        
        if ('torch' in capabilities) {
          hasFlash.current = true;
        }
        
        // Set video source
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.autoplay = true;
          
          try {
            await videoRef.current.play();
            console.log("Video playing");
          } catch (e) {
            console.error("Error playing video:", e);
          }
        }
        
        hasInitializedRef.current = true;
      } catch (error) {
        console.error("Camera access error:", error);
        toast.error("Could not access camera. Please check permissions.");
      }
    }
  };
  
  // Function to stop camera
  const stopCamera = () => {
    console.log("Stopping camera");
    setIsScanning(false);
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    hasInitializedRef.current = false;
  };
  
  // Handle scan mode changes
  const handleScanModeChange = (mode) => {
    setScanMode(mode);
    // Restart camera with new mode
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 300);
  };
  
  // Handle manual VIN submission
  const handleManualVinSubmit = async () => {
    const vinInput = document.getElementById("manual-vin-input");
    if (!vinInput) return;
    
    const enteredVin = vinInput.value;
    
    if (!enteredVin || enteredVin.trim().length !== 17) {
      toast.error("VIN must be 17 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${enteredVin}?format=json`);
      const data = await response.json();
      const results = data.Results;
      
      const makeResult = results.find(r => r.Variable === 'Make' && r.Value);
      const modelResult = results.find(r => r.Variable === 'Model' && r.Value);
      const yearResult = results.find(r => r.Variable === 'Model Year' && r.Value);
      
      if (makeResult?.Value && modelResult?.Value && yearResult?.Value) {
        setDetectedVehicle({
          vin: enteredVin,
          make: makeResult.Value,
          model: modelResult.Value,
          year: yearResult.Value
        });
        setIsConfirmationView(true);
      } else {
        setDetectedVehicle({
          vin: enteredVin,
          make: "Unknown",
          model: "Unknown",
          year: "Unknown"
        });
        setIsConfirmationView(true);
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error("Error validating VIN");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigation and confirmation handlers
  const handleConfirm = () => {
    if (detectedVehicle) {
      console.log("Navigating with VIN:", detectedVehicle.vin);
      navigate(returnPath, { 
        state: { 
          scannedVin: detectedVehicle.vin,
          vehicleInfo: {
            make: detectedVehicle.make,
            model: detectedVehicle.model,
            year: detectedVehicle.year
          } 
        } 
      });
      toast.success("VIN confirmed and saved successfully");
    }
  };
  
  const handleCancel = () => {
    navigate(returnPath);
  };
  
  const handleTryAgain = () => {
    setIsConfirmationView(false);
    setDetectedVehicle(null);
    
    if (!videoRef.current?.srcObject) {
      startCamera();
    } else {
      setIsScanning(true);
    }
  };
  
  // Calculate VIN details
  const getVinDetails = () => {
    if (!detectedVehicle?.vin) return null;
    return decodeVIN(detectedVehicle.vin);
  };
  
  const vinDetails = getVinDetails();
  
  // Component lifecycle
  useEffect(() => {
    console.log("Component mounted");
    isMountedRef.current = true;
    
    // Start camera with delay
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        startCamera();
      }
    }, 500);
    
    // Cleanup function
    return () => {
      console.log("Component unmounting");
      isMountedRef.current = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, []); // Empty dependency array
  
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
  );
}
