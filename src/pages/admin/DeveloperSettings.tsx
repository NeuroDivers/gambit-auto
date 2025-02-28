
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { PageTitle } from "@/components/shared/PageTitle"
import { VinScanner } from "@/components/shared/VinScanner"
import { useState } from "react"

export default function DeveloperSettings() {
  const [scannedVin, setScannedVin] = useState<string>("")

  return (
    <div className="container py-8 space-y-6">
      <PageTitle 
        title="Developer Settings" 
        description="Advanced settings and tools for developers"
      />

      <Tabs defaultValue="vin-scanner" className="w-full">
        <TabsList>
          <TabsTrigger value="vin-scanner">VIN Scanner</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vin-scanner">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">VIN Barcode Scanner</h3>
            <p className="text-muted-foreground mb-6">
              Test the VIN barcode scanner functionality. This uses the device camera to scan 
              VIN barcodes found on vehicle windows and documentation.
            </p>
            
            <div className="flex items-center gap-4">
              <VinScanner onScan={setScannedVin} />
              <div>
                <span className="text-sm text-muted-foreground">Scanned VIN:</span>
                <div className="font-mono bg-muted p-2 rounded mt-1">
                  {scannedVin || "No VIN scanned yet"}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
