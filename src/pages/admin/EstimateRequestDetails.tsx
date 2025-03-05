
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
        
        // Try directly with the table name first
        const { data: directData, error: directError } = await supabase
          .from("estimate_requests")
          .select("*")
          .eq("id", id)
          .single()
          
        if (directError) {
          console.error("Error with direct estimate request query:", directError)
          
          // Try alternative table name
          console.log("Trying with alternative table name 'quote_requests'")
          const { data: altData, error: altError } = await supabase
            .from("quote_requests")
            .select("*")
            .eq("id", id)
            .single()
            
          if (altError) {
            console.error("Alternative query also failed:", altError)
            toast.error("Could not load estimate request data")
            throw altError
          }
          
          console.log("Found data with alternative table name:", altData)
          setEstimateRequest(altData)
          setLoading(false)
          return
        }
        
        console.log("Successfully retrieved basic estimate request data:", directData)
        
        // If we got the basic data, try to fetch related info
        if (directData) {
          // Now try to get the full data with relations
          try {
            const { data: fullData, error: fullError } = await supabase
              .from("estimate_requests")
              .select(`
                *,
                customer:customers(*),
                vehicle_info:vehicles(*)
              `)
              .eq("id", id)
              .single()
              
            if (fullError) {
              console.log("Error fetching full data with relations:", fullError)
              console.log("Using basic data instead")
              setEstimateRequest(directData)
            } else {
              console.log("Successfully fetched full data with relations:", fullData)
              setEstimateRequest(fullData)
            }
          } catch (relationError) {
            console.error("Error in relation fetch:", relationError)
            setEstimateRequest(directData)
          }
        } else {
          console.log("No data found for this ID")
          setEstimateRequest(null)
        }
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
