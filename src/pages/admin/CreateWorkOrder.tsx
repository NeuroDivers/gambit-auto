
import { PageTitle } from "@/components/shared/PageTitle"
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm"
import { useNavigate } from "react-router-dom"

export default function CreateWorkOrder() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="Create Work Order" 
        description="Create a new work order by filling out the form below."
      />
      <div className="rounded-lg border bg-card p-6">
        <WorkOrderForm 
          onSuccess={() => navigate("/admin/work-orders")}
        />
      </div>
    </div>
  )
}
