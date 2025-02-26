
import React from 'react'

interface ScannerViewportProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function ScannerViewport({ videoRef, canvasRef }: ScannerViewportProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden">
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
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[30%] border-2 border-dashed border-primary-foreground/70">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
          Position VIN text here
        </div>
        <div className="absolute -left-2 -top-2 w-4 h-4 border-l-2 border-t-2 border-primary-foreground/70" />
        <div className="absolute -right-2 -top-2 w-4 h-4 border-r-2 border-t-2 border-primary-foreground/70" />
        <div className="absolute -left-2 -bottom-2 w-4 h-4 border-l-2 border-b-2 border-primary-foreground/70" />
        <div className="absolute -right-2 -bottom-2 w-4 h-4 border-r-2 border-b-2 border-primary-foreground/70" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-6 h-6">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-primary-foreground/70" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-px bg-primary-foreground/70" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
        <p className="text-white text-center text-sm">
          Position the VIN text within the frame
        </p>
      </div>
    </div>
  )
}
