
import { PageTitle } from "@/components/shared/PageTitle"
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function CreateWorkOrder() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle 
            title="Create Work Order" 
            description="Create a new work order by filling out the form below."
          />
        </div>
      </div>
      
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="max-w-7xl mx-auto py-6">
          <WorkOrderForm 
            onSuccess={() => navigate("/work-orders")}
            onSubmitting={setIsSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
