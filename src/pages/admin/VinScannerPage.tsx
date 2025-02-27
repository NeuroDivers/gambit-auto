
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BrowserMultiFormatReader } from '@zxing/library'
import { ArrowLeft, Camera, Clipboard, Text, Barcode, List } from "lucide-react"
import { toast } from 'sonner'
import { Toggle } from "@/components/ui/toggle"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function VinScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/admin/estimates'
  const returnPath = returnTo || '/admin/estimates'
  const navigate = useNavigate()
  const [manualVin, setManualVin] = useState('')
  const [scanMode, setScanMode] = useState<'text' | 'barcode'>('barcode')
  const [logs, setLogs] = useState<string[]>([])
  const [logsOpen, setLogsOpen] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  useEffect(() => {
    addLog('Scanner initialized')
    
    const codeReader = new BrowserMultiFormatReader()
    let selectedDeviceId: string | undefined

    codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length <= 0) {
          const errorMsg = 'No video input devices detected'
          console.error(errorMsg)
          addLog(errorMsg)
          return
        }

        // Log available devices
        videoInputDevices.forEach(device => {
          addLog(`Found camera: ${device.label || 'Unnamed camera'}`)
        })

        // Select the rear camera if available, otherwise use the first camera
        const rearCamera = videoInputDevices.find(device => 
          /back|rear/i.test(device.label)
        )
        selectedDeviceId = rearCamera?.deviceId || videoInputDevices[0].deviceId
        
        addLog(`Selected camera: ${videoInputDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Unknown camera'}`)
        addLog(`Scan mode: ${scanMode}`)

        return codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const vinCode = result.getText()
              console.log('Scanned VIN:', vinCode)
              addLog(`Successfully scanned code: ${vinCode}`)
              navigateWithResult(vinCode)
            }
            if (error && !(error instanceof TypeError)) {
              // TypeError is thrown when the scanner is stopped, so we ignore it
              console.error('Scanner error:', error)
              addLog(`Error: ${error.message || 'Unknown scanner error'}`)
            }
          }
        )
      })
      .catch(err => {
        console.error('Error starting scanner:', err)
        addLog(`Failed to start scanner: ${err.message || 'Unknown error'}`)
        toast.error('Error accessing camera. Please check permissions.')
      })

    return () => {
      addLog('Scanner stopped')
      codeReader.reset()
    }
  }, [scanMode, navigate])

  const navigateWithResult = (vin: string) => {
    // Store result in sessionStorage to pass to the previous page
    console.log('VinScannerPage: Storing scanned VIN in sessionStorage:', vin)
    addLog(`Storing VIN in session storage: ${vin}`)
    sessionStorage.setItem('scanned-vin', vin)
    toast.success(`VIN scanned: ${vin}`)
    
    // A small delay to ensure the data is saved before navigation
    setTimeout(() => {
      addLog(`Navigating back to: ${returnPath}`)
      navigate(returnPath)
    }, 100)
  }

  const handlePasteVin = async () => {
    try {
      const text = await navigator.clipboard.readText()
      addLog(`Pasted text from clipboard: ${text}`)
      if (text && text.length >= 17) {
        setManualVin(text)
      }
    } catch (err) {
      console.error('Failed to read clipboard contents:', err)
      addLog(`Failed to access clipboard: ${err instanceof Error ? err.message : 'Unknown error'}`)
      toast.error('Could not access clipboard. Please enter VIN manually.')
    }
  }

  const handleUseManualVin = () => {
    addLog(`Using manually entered VIN: ${manualVin}`)
    if (manualVin.length >= 17) {
      navigateWithResult(manualVin)
    } else {
      addLog(`Invalid VIN length: ${manualVin.length} (expected 17 or more)`)
      toast.error('Please enter a valid VIN (17 characters)')
    }
  }

  const navigateBack = () => {
    addLog(`User canceled. Returning to: ${returnPath}`)
    navigate(returnPath)
  }

  const toggleScanMode = () => {
    const newMode = scanMode === 'barcode' ? 'text' : 'barcode'
    addLog(`Changing scan mode from ${scanMode} to ${newMode}`)
    setScanMode(newMode)
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
                Point your camera at a VIN {scanMode === 'barcode' ? 'barcode' : 'text'} or manually enter the VIN
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Toggle 
                pressed={scanMode === 'barcode'}
                onPressedChange={() => toggleScanMode()}
                aria-label="Toggle scan mode"
              >
                {scanMode === 'barcode' ? <Barcode className="h-4 w-4 mr-1" /> : <Text className="h-4 w-4 mr-1" />}
                {scanMode === 'barcode' ? 'Barcode' : 'Text'} Mode
              </Toggle>
            </div>
            <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <List className="h-4 w-4 mr-1" />
                  Logs
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

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

          <Collapsible open={logsOpen}>
            <CollapsibleContent>
              <div className="border rounded-md mt-2 bg-gray-50 dark:bg-gray-900">
                <div className="p-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                  {logs.length === 0 ? (
                    <p>No logs yet</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="py-0.5">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
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
