
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { WorkOrderList } from "@/components/work-orders/WorkOrderList"

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
      
      <WorkOrderList />
    </div>
  )
}
