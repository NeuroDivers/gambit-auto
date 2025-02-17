
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

export default function WorkOrders() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Link to="/admin/work-orders/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </Link>
      </div>
      
      {/* Placeholder for WorkOrderList component */}
      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium">No work orders found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Get started by creating your first work order.
        </p>
      </div>
    </div>
  )
}
