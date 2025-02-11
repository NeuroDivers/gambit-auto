
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { WorkOrderList } from "@/components/work-orders/WorkOrderList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateWorkOrderDialog } from "@/components/work-orders/CreateWorkOrderDialog"
import { useState } from "react"

export default function WorkOrders() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-6 sm:py-12 px-0 lg:px-8">
        <div className="px-0 sm:px-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <PageBreadcrumbs />
              <h1 className="text-3xl font-bold">Work Orders</h1>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Work Order
            </Button>
          </div>
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
