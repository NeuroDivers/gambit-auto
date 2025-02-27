
import { ScannerViewportProps } from "./types"

export default function ScannerViewport({
  videoRef,
  canvasRef,
  detectedVehicle,
  isFlashingRed,
  textDetected
}: ScannerViewportProps) {
  // Determine the border color class based on detection status
  const borderColorClass = isFlashingRed ? 
    "border-red-500" : 
    (textDetected ? "border-green-500" : "border-purple-500");

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video w-full">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        autoPlay
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover opacity-0"
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="font-mono text-white text-xl">
          {detectedVehicle?.vin || ""}
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2">
        <div className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          Scanning for VIN...
        </div>
      </div>
      
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-16">
        <div className={`absolute inset-0 border-2 ${borderColorClass} rounded-lg transition-colors duration-300`} />
      </div>
    </div>
  )
}
