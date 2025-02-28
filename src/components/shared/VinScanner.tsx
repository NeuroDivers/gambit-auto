
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Pause, Play, Clipboard, Settings } from "lucide-react";
import { preprocessImage, postProcessVIN } from "@/utils/image-processing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsSelector } from "./settings/SettingsSelector";
import { toast } from "sonner";

interface VINScannerProps {
  onDetect: (vin: string) => void;
  onCancel?: () => void;
}

export function VinScanner({ onDetect, onCancel }: VINScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [detectedVin, setDetectedVin] = useState<string | null>(null);
  const [manualVin, setManualVin] = useState("");
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('scanner-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
    
    return {
      autoInvert: true,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      grayscaleMethod: 'blue-channel',
      blueEmphasis: 'very-high',
      contrast: 'very-high',
      morphKernelSize: '3',
    };
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize camera when component mounts
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);
  
  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('scanner-settings', JSON.stringify(settings));
  }, [settings]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }).catch(async () => {
        // Fallback to any available camera
        return await navigator.mediaDevices.getUserMedia({
          video: true
        });
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  const toggleScanning = () => {
    if (isScanning) {
      // Stop scanning
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      setIsScanning(false);
    } else {
      // Start scanning
      setIsScanning(true);
      scanIntervalRef.current = setInterval(scanFrame, 500);
    }
  };
  
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Process the image
    const imageData = preprocessImage(canvas);
    
    // Use OCR to detect VIN (simplified for this example)
    // In a real implementation, you would integrate with Tesseract.js
    // and add proper VIN validation logic
    const mockVin = "1HGCM82633A123456"; // Example VIN
    const processedVin = postProcessVIN(mockVin);
    
    if (processedVin) {
      setDetectedVin(processedVin);
      toggleScanning(); // Stop scanning once VIN is detected
    }
  };
  
  const handleManualVinSubmit = () => {
    const processedVin = postProcessVIN(manualVin);
    setDetectedVin(processedVin);
  };
  
  const handleConfirm = () => {
    if (detectedVin) {
      onDetect(detectedVin);
    }
  };
  
  const handleSettingsSave = (newSettings: any) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
        />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-16">
            <div className={`absolute inset-0 border-2 ${isScanning ? 'border-purple-500 animate-pulse' : 'border-gray-500'} rounded-lg`} />
          </div>
          {detectedVin && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full font-mono text-sm">
              {detectedVin}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button 
          onClick={toggleScanning} 
          variant={isScanning ? "destructive" : "default"}
          className="flex-1"
        >
          {isScanning ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Stop Scanning
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Scanning
            </>
          )}
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Enter VIN manually"
          value={manualVin}
          onChange={(e) => setManualVin(e.target.value.toUpperCase())}
          className="flex-1 px-3 py-2 border rounded"
          maxLength={17}
        />
        <Button onClick={handleManualVinSubmit}>
          <Clipboard className="h-4 w-4" />
        </Button>
      </div>
      
      {detectedVin && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDetectedVin(null)}>
            Scan Again
          </Button>
          <Button onClick={handleConfirm}>
            Use This VIN
          </Button>
        </div>
      )}
      
      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner Settings</DialogTitle>
          </DialogHeader>
          <SettingsSelector 
            settings={settings} 
            onSettingsChange={handleSettingsSave} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
