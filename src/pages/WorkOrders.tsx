
import { WorkOrderList } from "@/components/work-orders/WorkOrderList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateWorkOrderDialog } from "@/components/work-orders/CreateWorkOrderDialog"
import { useState } from "react"

export default function WorkOrders() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-4 px-4 lg:px-8">
        <div className="sticky top-4 z-10">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg"
            size="lg"
          >
            <Plus className="w-4 h-4" />
            Create Work Order
          </Button>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <WorkOrderList />
        </div>
        <CreateWorkOrderDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  )
}
