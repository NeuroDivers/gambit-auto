
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTitle } from "@/components/shared/PageTitle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VinScanner } from "@/components/shared/VinScanner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { preprocessImage, postProcessVIN, cropToVinRegion } from "@/utils/image-processing"
import { FileSpreadsheet, FileCode, FileSearch, Settings, Terminal, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DeveloperSettings() {
  // Common state
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("logs")
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    VITE_MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
    VITE_NHTSA_API_URL: import.meta.env.VITE_NHTSA_API_URL || 'https://vpic.nhtsa.dot.gov/api',
  })

  // Log tab state
  const [logEntries, setLogEntries] = useState<string[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)

  // Scanner tab state
  const [scannerActive, setScannerActive] = useState(false)
  const [scannerSettings, setScannerSettings] = useState({
    blueEmphasis: 'very-high',
    contrast: 'very-high',
    morphKernelSize: '3',
    grayscaleMethod: 'blue-channel',
    autoInvert: true,
    autoInvertDark: false,
    edgeEnhancement: true,
    noiseReduction: true,
    adaptiveContrast: true
  })
  const [scanResults, setScanResults] = useState<string[]>([])
  const [finalResult, setFinalResult] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanLog, setScanLog] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Handle OCR result
  const handleOcrComplete = (result: string) => {
    try {
      if (!result) {
        addScanLog('OCR returned empty result')
        return
      }
      
      addScanLog(`OCR raw result: ${result}`)
      const processed = postProcessVIN(result)
      addScanLog(`Processed result: ${processed}`)
      
      if (processed && processed.length >= 11) {
        setScanResults(prev => [processed, ...prev].slice(0, 10))
        setFinalResult(processed)
        setScannerActive(false)
      }
    } catch (error) {
      console.error('Error handling OCR result:', error)
      addScanLog(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const addScanLog = (message: string) => {
    setScanLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const startScanner = () => {
    setScannerActive(true)
    setIsScanning(true)
    setScanLog([])
    addScanLog('Scanner activated')
  }

  const stopScanner = () => {
    setScannerActive(false)
    setIsScanning(false)
    addScanLog('Scanner stopped')
  }

  // Save scanner settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('scanner-settings', JSON.stringify(scannerSettings))
    toast({
      title: "Settings saved",
      description: "Scanner settings have been saved to local storage"
    })
  }

  // Initialize scanner settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('scanner-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setScannerSettings(settings)
      } catch (e) {
        console.error('Error parsing scanner settings:', e)
      }
    }
    setIsInitialized(true)
  }, [])

  // Console log interceptor
  useEffect(() => {
    const originalConsoleLog = console.log
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    const originalConsoleInfo = console.info

    console.log = (...args) => {
      originalConsoleLog(...args)
      setLogEntries(prev => [...prev, `[LOG] ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}`])
    }

    console.error = (...args) => {
      originalConsoleError(...args)
      setLogEntries(prev => [...prev, `[ERROR] ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}`])
    }

    console.warn = (...args) => {
      originalConsoleWarn(...args)
      setLogEntries(prev => [...prev, `[WARN] ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}`])
    }

    console.info = (...args) => {
      originalConsoleInfo(...args)
      setLogEntries(prev => [...prev, `[INFO] ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}`])
    }

    return () => {
      console.log = originalConsoleLog
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      console.info = originalConsoleInfo
    }
  }, [])

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logEntries])

  useEffect(() => {
    console.log(`Switched to tab: ${activeTab}`)
  }, [activeTab])

  // Handle API key changes
  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }))
  }
  
  return (
    <div className="container py-6 space-y-6">
      <PageTitle 
        title="Developer Settings" 
        description="Advanced settings and developer tools"
      />
      
      <Tabs defaultValue="logs" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span>Logs</span>
          </TabsTrigger>
          <TabsTrigger value="ocr-scanner" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span>OCR Scanner</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>API Keys</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Console Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-500 font-mono p-4 rounded-md h-[600px] overflow-y-auto">
                {logEntries.length === 0 ? (
                  <div className="text-gray-500 italic">No logs yet...</div>
                ) : (
                  <>
                    {logEntries.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap break-all">{log}</div>
                    ))}
                    <div ref={logEndRef} />
                  </>
                )}
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setLogEntries([])}
                >
                  Clear Logs
                </Button>
                <Button
                  onClick={() => {
                    const blob = new Blob([logEntries.join('\n')], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `logs-${new Date().toISOString()}.txt`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                >
                  Download Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* OCR Scanner Tab */}
        <TabsContent value="ocr-scanner" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:row-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5" />
                  VIN Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Scanner View */}
                  <div className={`${scannerActive ? 'block' : 'hidden'}`}>
                    <VinScanner
                      onScan={handleOcrComplete}
                      isActive={scannerActive}
                      scanMode="text"
                    />
                  </div>
                  
                  {/* Scanner Controls */}
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="final-result">Final Result</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="final-result" 
                          value={finalResult}
                          onChange={(e) => setFinalResult(e.target.value)}
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(finalResult)
                            toast({
                              title: "Copied",
                              description: "VIN copied to clipboard"
                            })
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!scannerActive ? (
                        <Button 
                          onClick={startScanner}
                          className="w-full"
                        >
                          Start Scanner
                        </Button>
                      ) : (
                        <Button 
                          onClick={stopScanner}
                          variant="destructive"
                          className="w-full"
                        >
                          Stop Scanner
                        </Button>
                      )}
                    </div>
                    
                    {/* Recent Results */}
                    {scanResults.length > 0 && (
                      <div>
                        <Label>Recent Results</Label>
                        <div className="mt-2 space-y-2">
                          {scanResults.map((result, index) => (
                            <div 
                              key={index}
                              className="font-mono text-sm p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                              onClick={() => setFinalResult(result)}
                            >
                              {result}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Scanner Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Scanner Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="blue-emphasis">Blue Channel Emphasis</Label>
                    <select
                      id="blue-emphasis"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                      value={scannerSettings.blueEmphasis}
                      onChange={(e) => setScannerSettings({...scannerSettings, blueEmphasis: e.target.value})}
                    >
                      <option value="zero">None</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very-high">Very High</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contrast">Contrast Level</Label>
                    <select
                      id="contrast"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                      value={scannerSettings.contrast}
                      onChange={(e) => setScannerSettings({...scannerSettings, contrast: e.target.value})}
                    >
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very-high">Very High</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grayscale-method">Grayscale Method</Label>
                    <select
                      id="grayscale-method"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                      value={scannerSettings.grayscaleMethod}
                      onChange={(e) => setScannerSettings({...scannerSettings, grayscaleMethod: e.target.value})}
                    >
                      <option value="average">Average RGB</option>
                      <option value="luminosity">Luminosity</option>
                      <option value="blue-channel">Blue Channel</option>
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-invert"
                        className="h-4 w-4"
                        checked={scannerSettings.autoInvert}
                        onChange={(e) => setScannerSettings({...scannerSettings, autoInvert: e.target.checked})}
                      />
                      <Label htmlFor="auto-invert">Auto Invert (Light on Dark)</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edge-enhancement"
                        className="h-4 w-4"
                        checked={scannerSettings.edgeEnhancement}
                        onChange={(e) => setScannerSettings({...scannerSettings, edgeEnhancement: e.target.checked})}
                      />
                      <Label htmlFor="edge-enhancement">Edge Enhancement</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="noise-reduction"
                        className="h-4 w-4"
                        checked={scannerSettings.noiseReduction}
                        onChange={(e) => setScannerSettings({...scannerSettings, noiseReduction: e.target.checked})}
                      />
                      <Label htmlFor="noise-reduction">Noise Reduction</Label>
                    </div>
                  </div>
                  
                  <Button onClick={saveSettings} className="w-full">
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Scanner Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Scanner Debug Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-500 font-mono p-4 rounded-md h-[300px] overflow-y-auto">
                  {scanLog.length === 0 ? (
                    <div className="text-gray-500 italic">No scanner logs yet...</div>
                  ) : (
                    scanLog.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap break-all text-sm">{log}</div>
                    ))
                  )}
                </div>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => setScanLog([])}
                >
                  Clear Scanner Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mapbox-token">Mapbox Access Token</Label>
                  <Input 
                    id="mapbox-token"
                    value={apiKeys.VITE_MAPBOX_ACCESS_TOKEN}
                    onChange={(e) => handleApiKeyChange('VITE_MAPBOX_ACCESS_TOKEN', e.target.value)}
                    type="password"
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for address autocomplete functionality
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nhtsa-api">NHTSA API URL</Label>
                  <Input 
                    id="nhtsa-api"
                    value={apiKeys.VITE_NHTSA_API_URL}
                    onChange={(e) => handleApiKeyChange('VITE_NHTSA_API_URL', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    API endpoint for VIN decoding (default: https://vpic.nhtsa.dot.gov/api)
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setApiKeys({
                        VITE_MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
                        VITE_NHTSA_API_URL: 'https://vpic.nhtsa.dot.gov/api',
                      })
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={() => {
                      localStorage.setItem('api-keys', JSON.stringify(apiKeys))
                      toast({
                        title: "API Keys Saved",
                        description: "Changes will take effect after reload"
                      })
                    }}
                  >
                    Save API Keys
                  </Button>
                </div>
                
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-md text-yellow-800 dark:text-yellow-200 text-sm">
                  <h4 className="font-semibold flex items-center gap-1 mb-2">
                    <BookOpen className="h-4 w-4" />
                    Important Note
                  </h4>
                  <p>
                    For security, API keys should be set in your project's environment variables.
                    The keys stored here are only used for local testing and development.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
