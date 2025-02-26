
import React, { useState } from 'react'
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as Dialog from "@radix-ui/react-dialog"
import { useVinScanner } from "./vin-scanner/hooks/useVinScanner"
import { ScannerOverlay } from "./vin-scanner/ScannerOverlay"
import { ScannerViewport } from "./vin-scanner/components/ScannerViewport"
import { LogsDisplay } from "./vin-scanner/components/LogsDisplay"
import { cn } from "@/lib/utils"

interface VinScannerProps {
  onScan: (vin: string) => void
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[99] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <Dialog.Content 
      ref={ref} 
      className={cn(
        "fixed left-[50%] top-[50%] z-[100] w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )} 
      {...props} 
      onPointerDownOutside={(e) => e.preventDefault()}
    />
  </Dialog.Portal>
))
DialogContent.displayName = "DialogContent"

export function VinScanner({ onScan }: VinScannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    videoRef,
    canvasRef,
    logsEndRef,
    logs,
    hasFlash,
    isFlashOn,
    isPaused,
    toggleFlash,
    togglePause,
    startCamera,
    stopCamera
  } = useVinScanner({
    onScan,
    onClose: () => setIsDialogOpen(false)
  })

  const handleOpen = () => {
    setIsDialogOpen(true)
    setTimeout(startCamera, 0)
  }

  const handleClose = () => {
    stopCamera()
    setIsDialogOpen(false)
  }

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="icon"
        onClick={handleOpen}
        className="shrink-0"
      >
        <Camera className="h-4 w-4" />
      </Button>

      <Dialog.Root open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="p-0">
          <ScannerOverlay
            onFlashToggle={toggleFlash}
            onClose={handleClose}
            isPaused={isPaused}
            onPauseToggle={togglePause}
            hasFlash={hasFlash}
            isFlashOn={isFlashOn}
          />
          <ScannerViewport
            videoRef={videoRef}
            canvasRef={canvasRef}
          />
          <LogsDisplay
            logs={logs}
            logsEndRef={logsEndRef}
          />
        </DialogContent>
      </Dialog.Root>
    </>
  )
}
