
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
import { toast } from "sonner"

export default function EstimateRequestDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast: useToastApi } = useToast()
  const [estimateRequest, setEstimateRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Estimate Request | Auto Detailing CRM"
    
    const fetchEstimateRequest = async () => {
      try {
        console.log("Attempting to fetch estimate request with ID:", id)
        
        const { data, error } = await supabase
          .from("estimate_requests")
          .select(`
            *,
            clients(*)
          `)
          .eq("id", id)
          .single()
          
        if (error) {
          console.error("Error fetching estimate request:", error)
          toast.error("Could not load estimate request data")
          throw error
        }
        
        console.log("Successfully retrieved estimate request data:", data)
        setEstimateRequest(data)
      } catch (error) {
        console.error("Error fetching estimate request:", error)
        toast.error("Failed to load estimate request")
        useToastApi({
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
  }, [id, useToastApi])

  const handleCreateEstimate = () => {
    // Navigate to create estimate page with pre-filled data
    navigate("/estimates/create", { 
      state: { 
        estimateRequestId: estimateRequest.id,
        clientId: estimateRequest.customer_id
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
        <CustomerInfo customer={estimateRequest.clients} />
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">Make:</p>
              <p>{estimateRequest.vehicle_make || "Not provided"}</p>
            </div>
            <div>
              <p className="font-medium">Model:</p>
              <p>{estimateRequest.vehicle_model || "Not provided"}</p>
            </div>
            <div>
              <p className="font-medium">Year:</p>
              <p>{estimateRequest.vehicle_year || "Not provided"}</p>
            </div>
            {estimateRequest.vehicle_vin && (
              <div>
                <p className="font-medium">VIN:</p>
                <p>{estimateRequest.vehicle_vin}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {estimateRequest.description && (
            <div>
              <p className="font-medium">Description:</p>
              <p>{estimateRequest.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {estimateRequest.media_urls && estimateRequest.media_urls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Media</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {estimateRequest.media_urls.map((url, index) => (
              <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                <img src={url} alt={`Uploaded media ${index + 1}`} className="w-full h-auto rounded-md" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
