
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

  useEffect(() => {
    const fetchEstimateRequests = async () => {
      try {
        console.log("Attempting to fetch estimate_requests")
        
        // First, check that the table exists and has data
        const { count, error: countError } = await supabase
          .from("estimate_requests")
          .select("*", { count: "exact", head: true })
        
        if (countError) {
          console.error("Error checking estimate requests count:", countError)
          toast.error("Failed to check estimate requests. Please try again.")
          setEstimateRequests([])
          return
        }
        
        console.log(`Found ${count} estimate requests in the database`)
        
        // Now fetch the actual data with relations
        const { data: estimateRequests, error } = await supabase
          .from("estimate_requests")
          .select(`
            id, 
            created_at, 
            status, 
            description,
            customer_id,
            customers!estimate_requests_customer_id_fkey(first_name, last_name, email)
          `)
          .order("created_at", { ascending: false })
          .limit(30)
        
        if (error) {
          console.error("Error fetching estimate requests:", error)
          toast.error("Failed to load estimate requests. Please try again.")
          setEstimateRequests([])
        } else {
          console.log("Successfully fetched estimate requests:", estimateRequests)
          setEstimateRequests(estimateRequests || [])
        }
      } catch (error) {
        console.error("Error in estimate requests fetch flow:", error)
        toast.error("Failed to load estimate requests. Please try again.")
        setEstimateRequests([])
      } finally {
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
      </div>

      {estimateRequests.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No estimate requests yet</h3>
          <p className="text-muted-foreground mt-1">
            Customers can submit estimate requests through your website
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Service Type</TableHead>
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
                      : "Unknown Customer"}
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.description ? "Custom Request" : "General"}
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
