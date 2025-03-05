
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft, ClipboardList } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { CustomerInfo } from "@/components/estimates/sections/CustomerInfo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EstimateStatus } from "@/components/estimates/sections/EstimateStatus"
import { toast } from "sonner"

export default function EstimateRequestDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast: useToastApi } = useToast()
  const [estimateRequest, setEstimateRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [debug, setDebug] = useState(null)

  useEffect(() => {
    document.title = "Estimate Request | Auto Detailing CRM"
    
    const fetchEstimateRequest = async () => {
      try {
        console.log("Attempting to fetch estimate request with ID:", id)
        
        // First, check if the estimate request exists
        const { count, error: countError } = await supabase
          .from("estimate_requests")
          .select("*", { count: "exact", head: true })
          .eq("id", id)
        
        if (countError) {
          console.error("Error checking estimate request:", countError)
          throw countError
        }
        
        console.log(`Found ${count} matching estimate requests`)
        
        if (count === 0) {
          console.error("No estimate request found with ID:", id)
          setEstimateRequest(null)
          setLoading(false)
          return
        }
        
        // Try a basic query first to make sure we can get the data
        const { data: basicData, error: basicError } = await supabase
          .from("estimate_requests")
          .select("*")
          .eq("id", id)
          .single()
          
        if (basicError) {
          console.error("Error fetching basic estimate request data:", basicError)
        } else {
          console.log("Basic estimate request data:", basicData)
          setDebug(basicData)
        }
        
        // Now try with the customer relation using explicit foreign key
        const { data, error } = await supabase
          .from("estimate_requests")
          .select(`
            *,
            customers!estimate_requests_customer_id_fkey(*)
          `)
          .eq("id", id)
          .single()
          
        if (error) {
          console.error("Error fetching estimate request with relations:", error)
          
          // Fall back to basic data if relations failed
          if (basicData) {
            console.log("Using basic estimate request data as fallback")
            setEstimateRequest(basicData)
          } else {
            toast.error("Could not load estimate request data")
            throw error
          }
        } else {
          console.log("Successfully retrieved estimate request data:", data)
          setEstimateRequest(data)
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
      
      {debug && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-60">{JSON.stringify(debug, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {estimateRequest.customers ? (
          <CustomerInfo customer={estimateRequest.customers} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">Customer ID:</p>
                <p>{estimateRequest.customer_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Full customer details not available
                </p>
              </div>
            </CardContent>
          </Card>
        )}
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
          {estimateRequest.service_details && Object.keys(estimateRequest.service_details).length > 0 && (
            <div>
              <p className="font-medium">Service Details:</p>
              <pre className="text-xs mt-2 bg-gray-50 p-2 rounded">{JSON.stringify(estimateRequest.service_details, null, 2)}</pre>
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
