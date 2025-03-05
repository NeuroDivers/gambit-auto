
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft, ClipboardList } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { CustomerInfo } from "@/components/estimates/sections/CustomerInfo"
import { VehicleInfo } from "@/components/estimates/sections/VehicleInfo"
import { EstimateNotes } from "@/components/estimates/sections/EstimateNotes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EstimateStatus } from "@/components/estimates/sections/EstimateStatus"

export default function EstimateRequestDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [estimateRequest, setEstimateRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Estimate Request | Auto Detailing CRM"
    
    const fetchEstimateRequest = async () => {
      try {
        const { data, error } = await supabase
          .from("estimate_requests")
          .select(`
            *,
            customer:customers(*),
            vehicle_info:vehicles(*)
          `)
          .eq("id", id)
          .single()

        if (error) throw error
        console.log("Fetched estimate request:", data)
        setEstimateRequest(data)
      } catch (error) {
        console.error("Error fetching estimate request:", error)
        toast({
          variant: "destructive",
          title: "Failed to load estimate request",
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEstimateRequest()
    }
  }, [id, toast])

  const handleCreateEstimate = () => {
    // Navigate to create estimate page with pre-filled data
    navigate("/estimates/create", { 
      state: { 
        estimateRequestId: estimateRequest.id,
        customerId: estimateRequest.customer_id,
        vehicleId: estimateRequest.vehicle_id
      } 
    })
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!estimateRequest) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Estimate Request Not Found</h2>
        <p className="mb-6">The estimate request you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/estimates")}>
          Back to Estimates
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/estimates")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <PageTitle
              title="Estimate Request Details"
              description={`Submitted on ${new Date(estimateRequest.created_at).toLocaleDateString()}`}
            />
            <div className="mt-2">
              <EstimateStatus status={estimateRequest.status || "Pending"} />
            </div>
          </div>
        </div>
        
        <Button onClick={handleCreateEstimate}>
          <ClipboardList className="h-4 w-4 mr-2" />
          Create Estimate
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomerInfo customer={estimateRequest.customer} />
        <VehicleInfo vehicle={estimateRequest.vehicle_info} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="font-medium">Service Type:</p>
            <p>{estimateRequest.service_type || "General Service"}</p>
          </div>
          {estimateRequest.requested_date && (
            <div>
              <p className="font-medium">Requested Date:</p>
              <p>{new Date(estimateRequest.requested_date).toLocaleDateString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <EstimateNotes notes={estimateRequest.notes} />
    </div>
  )
}
