
import { Dialog, DialogContent } from "../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Client } from "./types"
import { ClientStatistics } from "./ClientStatistics"
import { VehicleList } from "./vehicles/VehicleList"

interface ClientDetailsDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientDetailsDialog({ client, open, onOpenChange }: ClientDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <ClientStatistics client={client} />
          </TabsContent>
          <TabsContent value="vehicles" className="mt-4">
            <VehicleList clientId={client.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
