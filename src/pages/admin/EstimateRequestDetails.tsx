
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft, ClipboardList } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

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
          <PageTitle
            title="Estimate Request Details"
            description={`Submitted on ${new Date(estimateRequest.created_at).toLocaleDateString()}`}
          />
        </div>
        
        <Button onClick={handleCreateEstimate}>
          <ClipboardList className="h-4 w-4 mr-2" />
          Create Estimate
        </Button>
      </div>
      
      {/* Estimate request content would go here */}
      <div className="border rounded-lg p-6">
        <p>Estimate request details implementation needed</p>
      </div>
    </div>
  )
}
