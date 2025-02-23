
import { ScanMode } from "./useVinScanner"

interface ScannerOverlayProps {
  scanMode: ScanMode
}

export function ScannerOverlay({ scanMode }: ScannerOverlayProps) {
  return (
    <>
      <div className="absolute inset-0 border-2 border-primary opacity-50" />
      <div className="absolute inset-[15%] border-2 border-dashed border-primary-foreground/70">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
          Position VIN {scanMode === 'barcode' ? 'barcode' : 'text'} here
        </div>
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-primary-foreground/70" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-primary-foreground/70" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
        <p className="text-white text-center text-sm">
          Position the VIN {scanMode === 'barcode' ? 'barcode' : 'text'} within the frame
        </p>
      </div>
    </>
  )
}
