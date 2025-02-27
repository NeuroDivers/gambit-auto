
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BrowserMultiFormatReader } from '@zxing/library'
import { ArrowLeft, Camera, Clipboard } from "lucide-react"
import { toast } from 'sonner'

export default function VinScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/admin/estimates'
  const returnPath = returnTo || '/admin/estimates'
  const navigate = useNavigate()
  const [manualVin, setManualVin] = useState('')

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    let selectedDeviceId: string | undefined

    codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length <= 0) {
          console.error('No video input devices detected')
          return
        }

        // Select the rear camera if available, otherwise use the first camera
        const rearCamera = videoInputDevices.find(device => 
          /back|rear/i.test(device.label)
        )
        selectedDeviceId = rearCamera?.deviceId || videoInputDevices[0].deviceId

        return codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const vinCode = result.getText()
              console.log('Scanned VIN:', vinCode)
              navigateWithResult(vinCode)
            }
            if (error && !(error instanceof TypeError)) {
              // TypeError is thrown when the scanner is stopped, so we ignore it
              console.error('Scanner error:', error)
            }
          }
        )
      })
      .catch(err => {
        console.error('Error starting scanner:', err)
        toast.error('Error accessing camera. Please check permissions.')
      })

    return () => {
      codeReader.reset()
    }
  }, [navigate])

  const navigateWithResult = (vin: string) => {
    // Store result in sessionStorage to pass to the previous page
    console.log('VinScannerPage: Storing scanned VIN in sessionStorage:', vin)
    sessionStorage.setItem('scanned-vin', vin)
    toast.success(`VIN scanned: ${vin}`)
    
    // A small delay to ensure the data is saved before navigation
    setTimeout(() => {
      navigate(returnPath)
    }, 100)
  }

  const handlePasteVin = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text && text.length >= 17) {
        setManualVin(text)
      }
    } catch (err) {
      console.error('Failed to read clipboard contents:', err)
      toast.error('Could not access clipboard. Please enter VIN manually.')
    }
  }

  const handleUseManualVin = () => {
    if (manualVin.length >= 17) {
      navigateWithResult(manualVin)
    } else {
      toast.error('Please enter a valid VIN (17 characters)')
    }
  }

  const navigateBack = () => {
    navigate(returnPath)
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={navigateBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Scan VIN</CardTitle>
              <CardDescription>
                Point your camera at a VIN barcode or manually enter the VIN
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-black relative rounded-md overflow-hidden aspect-video">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 border-2 border-primary/50 rounded-md pointer-events-none" />
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualVin}
                onChange={(e) => setManualVin(e.target.value)}
                placeholder="Enter VIN manually"
                className="w-full px-3 py-2 border rounded-md"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={handlePasteVin}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleUseManualVin}>Use</Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={navigateBack}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
