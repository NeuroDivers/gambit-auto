
import { PageTitle } from "@/components/shared/PageTitle"
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function CreateWorkOrder() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 pb-10">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle 
            title="Create Work Order" 
            description="Create a new work order by filling out the form below."
          />
        </div>
      </div>
      
      <div className="px-6">
        <Card className="max-w-7xl mx-auto border-none shadow-none">
          <CardContent className="p-6">
            <WorkOrderForm 
              onSuccess={() => navigate("/work-orders")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
