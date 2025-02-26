import { Trash2, Sun, Globe, Shield, Database, Code, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VinScanner } from "@/components/shared/VinScanner"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DeveloperSettings() {
  const [scannerLogs, setScannerLogs] = useState<Array<{
    timestamp: string;
    message: string;
    type: string;
  }>>([])

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('scanner-logs') || '[]')
    setScannerLogs(logs)
  }, [])

  const handleClearCache = () => {
    localStorage.clear()
    setScannerLogs([])
    toast.success("Cache cleared successfully")
  }

  const handleVinScanned = (vin: string) => {
    toast.success(`VIN scanned: ${vin}`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Developer Settings</h1>
        <Button 
          variant="outline" 
          onClick={handleClearCache}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear Cache
        </Button>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs" className="space-x-2">
            <Code className="h-4 w-4" />
            <span>Scanner Debug</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="space-x-2">
            <Sun className="h-4 w-4" />
            <span>Theme Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="space-x-2">
            <Globe className="h-4 w-4" />
            <span>API Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="space-x-2">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center justify-between">
                Scanner Debug
                <VinScanner onScan={handleVinScanned} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="absolute right-0 top-0"
                  onClick={() => {
                    localStorage.removeItem('scanner-logs')
                    setScannerLogs([])
                    toast.success("Scanner logs cleared")
                  }}
                >
                  Clear Logs
                </Button>
                <ScrollArea className="h-[500px] w-full rounded-md border p-4 mt-12">
                  <div className="space-y-2">
                    {scannerLogs.map((log, index) => (
                      <div key={index} className="text-sm font-mono">
                        <span className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <span className="mx-2">-</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Theme configuration options will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                API configuration options will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Security configuration options will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Database configuration options will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
