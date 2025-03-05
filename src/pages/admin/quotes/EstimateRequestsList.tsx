
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { toast } from "sonner"

export function EstimateRequestsList() {
  const navigate = useNavigate()
  const [estimateRequests, setEstimateRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    const fetchEstimateRequests = async () => {
      try {
        console.log("Attempting to fetch estimate_requests")
        
        // Use a simple query without joins to get the basic data
        const { data: basicEstimateRequests, error: basicError } = await supabase
          .from("estimate_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30)
          
        if (basicError) {
          console.error("Error fetching basic estimate requests:", basicError)
          toast.error("Failed to load estimate requests. Please try again.")
          setEstimateRequests([])
          setLoading(false)
          return
        } 
        
        console.log("Basic estimate requests data:", basicEstimateRequests)
        
        // Use the basic data as our primary data source
        setEstimateRequests(basicEstimateRequests || [])
        
        // Try to fetch additional customer data for each request
        if (basicEstimateRequests && basicEstimateRequests.length > 0) {
          // Get all unique customer IDs
          const customerIds = [...new Set(basicEstimateRequests.map(req => req.customer_id))]
          
          // Fetch customer data separately
          const { data: customers, error: customerError } = await supabase
            .from("customers")
            .select("id, first_name, last_name, email")
            .in("id", customerIds)
          
          if (customerError) {
            console.error("Error fetching customer data:", customerError)
          } else if (customers && customers.length > 0) {
            // Create a map of customer data by ID for quick lookup
            const customerMap = customers.reduce((map, customer) => {
              map[customer.id] = customer
              return map
            }, {})
            
            // Enhance the estimate requests with customer data
            const enhancedRequests = basicEstimateRequests.map(request => ({
              ...request,
              customers: customerMap[request.customer_id] || null
            }))
            
            setEstimateRequests(enhancedRequests)
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error in estimate requests fetch flow:", error)
        toast.error("Failed to load estimate requests. Please try again.")
        setEstimateRequests([])
        setLoading(false)
      }
    }

    fetchEstimateRequests()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "estimated":
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "accepted":
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Estimate Requests</h2>
        <p className="text-muted-foreground">
          Review and respond to customer estimate requests
        </p>
        {debugInfo && (
          <div className="bg-yellow-50 p-4 mt-4 rounded border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800">Debug Information</h3>
            <pre className="text-xs mt-2 overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>

      {estimateRequests.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <h3 className="text-lg font-medium">No estimate requests yet</h3>
          <p className="text-muted-foreground mt-1 mb-6">
            Customers can submit estimate requests through your website
          </p>
          <Button 
            onClick={() => navigate('/estimates/create')}
            variant="outline"
          >
            Create Test Estimate Request
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimateRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {`REQ-${request.id.substring(0, 8)}`}
                  </TableCell>
                  <TableCell>
                    {request.customers 
                      ? `${request.customers.first_name} ${request.customers.last_name}`
                      : request.customer_id 
                        ? "Customer ID: " + request.customer_id.substring(0, 8)
                        : "Unknown Customer"}
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.vehicle_make && request.vehicle_model 
                      ? `${request.vehicle_make} ${request.vehicle_model} ${request.vehicle_year || ''}`
                      : "Not specified"}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={getStatusColor(request.status)}
                      variant="outline"
                    >
                      {request.status || "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/estimates/requests/${request.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
