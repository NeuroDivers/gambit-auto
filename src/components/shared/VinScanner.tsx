
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/browser"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface VinScannerProps {
  onScan: (vin: string) => void
}

export function VinScanner({ onScan }: VinScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [reader, setReader] = useState<BrowserMultiFormatReader | null>(null)

  const startScanning = async () => {
    try {
      setIsScanning(true)
      const videoElement = document.getElementById('video-preview') as HTMLVideoElement
      
      if (!videoElement) {
        throw new Error("Video element not found")
      }

      // Create a new reader instance
      const newReader = new BrowserMultiFormatReader()
      setReader(newReader)
      
      try {
        // Request camera access with preference for environment-facing camera
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" }
          }
        }

        // Start continuous scanning
        await newReader.decodeFromConstraints(
          constraints, 
          videoElement, 
          (result, error) => {
            if (result) {
              // Process successful scan
              const rawText = result.getText()
              console.log("Scanned barcode text:", rawText)
              
              // Process the VIN (clean it)
              const processedVin = processRawBarcodeText(rawText)
              
              if (processedVin && isValidVinFormat(processedVin)) {
                // Close scanner and return processed VIN
                if (newReader) {
                  try {
                    // Stop scanning
                    newReader.stopContinuousDecode();
                    stopStreamTracks(videoElement);
                  } catch (e) {
                    console.error("Error stopping scanner:", e);
                  }
                }
                
                setIsScanning(false)
                setIsOpen(false)
                onScan(processedVin)
                toast.success("VIN scanned successfully!")
              } else {
                toast.error("Invalid VIN format detected. Please try again.")
              }
            }
            
            if (error && !(error instanceof TypeError)) {
              // We ignore TypeError as it's thrown when no barcode is found
              console.error("Barcode scanning error:", error)
            }
          }
        )
      } catch (error) {
        console.error("Error accessing camera:", error)
        toast.error("Could not access camera. Please check permissions.")
        setIsScanning(false)
      }
    } catch (error) {
      console.error("Scanner initialization error:", error)
      toast.error("Failed to initialize barcode scanner")
      setIsScanning(false)
    }
  }

  const stopStreamTracks = (videoElement: HTMLVideoElement) => {
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoElement.srcObject = null
    }
  }

  const stopScanning = () => {
    // Stop the scanner if it's running
    if (reader) {
      try {
        reader.stopContinuousDecode();
      } catch (e) {
        console.error("Error stopping scanner:", e);
      }
    }
    
    // Stop all media streams
    const videoElement = document.getElementById('video-preview') as HTMLVideoElement
    stopStreamTracks(videoElement);
    
    setIsScanning(false)
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        type="button"
        onClick={() => setIsOpen(true)}
        title="Scan VIN Barcode"
      >
        <Camera className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          stopScanning()
        }
        setIsOpen(open)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan VIN Barcode</DialogTitle>
            <DialogDescription>
              Position the VIN barcode within the scanner frame.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative aspect-video bg-black rounded-md overflow-hidden">
            <video 
              id="video-preview" 
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            ></video>
            
            {/* Scanning guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[90%] h-16 border-2 border-blue-500 rounded-lg flex items-center justify-center">
                {isScanning && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500 animate-pulse"></div>
                )}
                <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                  {isScanning ? "Scanning..." : "Start scanning"}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => {
                stopScanning()
                setIsOpen(false)
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            
            <Button 
              type="button"
              onClick={isScanning ? stopScanning : startScanning}
              variant={isScanning ? "destructive" : "default"}
            >
              <Camera className="h-4 w-4 mr-2" />
              {isScanning ? "Stop Scanning" : "Start Scanning"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Implements intelligent barcode text processing based on common VIN scanning issues
 */
function processRawBarcodeText(text: string): string {
  if (!text || text.length < 17) {
    return text;
  }
  
  // Clean up non-alphanumeric characters
  let cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Apply the conditional processing logic
  
  // If text starts with "I", take the right 17 characters
  if (cleaned.startsWith("I") && cleaned.length > 17) {
    return cleaned.slice(-17);
  }
  
  // If text contains ",", take the left 17 characters
  if (text.includes(",") && cleaned.length > 17) {
    return cleaned.substring(0, 17);
  }
  
  // If text contains " ", take the left 17 characters
  if (text.includes(" ") && cleaned.length > 17) {
    return cleaned.substring(0, 17);
  }
  
  // If text ends with "G", take the left 17 characters
  if (cleaned.length > 17 && cleaned.charAt(cleaned.length - 1) === "G") {
    return cleaned.substring(0, 17);
  }
  
  // If it's exactly 17 characters, it's probably already good
  if (cleaned.length === 17) {
    return cleaned;
  }
  
  // If it's 18 characters, try removing first or last character
  if (cleaned.length === 18) {
    // Check if first char is a common prefix character
    if (['I', '1', 'L'].includes(cleaned[0])) {
      return cleaned.substring(1);
    }
    // Check if last char is a common suffix character
    if (['G', 'Q', 'O', '0'].includes(cleaned[cleaned.length - 1])) {
      return cleaned.substring(0, 17);
    }
    // Default to taking the first 17 chars
    return cleaned.substring(0, 17);
  }
  
  // For longer strings, take the first 17 characters (most common scenario)
  if (cleaned.length > 18) {
    return cleaned.substring(0, 17);
  }
  
  // Return whatever we have if it's less than 17 characters
  return cleaned;
}

/**
 * Basic VIN format validation
 */
function isValidVinFormat(vin: string): boolean {
  if (!vin || vin.length !== 17) return false;
  
  // Basic pattern validation (no I, O, Q allowed in valid VINs)
  const validVINPattern = /^[A-HJ-NPR-Z0-9]{17}$/;
  return validVINPattern.test(vin);
}
