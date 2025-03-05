
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
        // Try a direct table select first without any filters
        console.log("Attempting to fetch estimate_requests directly")
        const { data: rawData, error: rawError } = await supabase
          .from("estimate_requests")
          .select("id, created_at, status, service_type, customer_id, name")
          .limit(30)
        
        if (rawError) {
          console.error("Error fetching raw estimate requests:", rawError)
          throw rawError
        }
        
        console.log("Raw estimate requests data:", rawData)
        
        if (rawData && rawData.length > 0) {
          // If we got raw data, try to enhance it with customer information
          const { data, error } = await supabase
            .from("estimate_requests")
            .select(`
              *,
              customer:customers(first_name, last_name, email)
            `)
            .order("created_at", { ascending: false })

          if (error) {
            console.error("Error fetching estimate requests with customer join:", error)
            console.log("Using raw data as fallback")
            setEstimateRequests(rawData)
          } else {
            console.log("Fetched estimate requests with customer join:", data)
            setEstimateRequests(data || [])
          }
        } else {
          // If no results from the first query, try an alternative approach
          console.log("No results found, trying an alternative query")
          
          // Try querying with a different table name in case there's a view or naming difference
          const { data: altData, error: altError } = await supabase
            .from("quote_requests")
            .select("*")
            .limit(30)
          
          if (altError) {
            console.error("Alternative query also failed:", altError)
          } else {
            console.log("Alternative query results:", altData)
            if (altData && altData.length > 0) {
              setEstimateRequests(altData)
            } else {
              setEstimateRequests([])
            }
          }
        }
      } catch (error) {
        console.error("Error in estimate requests fetch flow:", error)
        toast.error("Failed to load estimate requests. Please try again.")
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
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
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
                    {request.customer 
                      ? `${request.customer.first_name} ${request.customer.last_name}`
                      : request.name || "Unknown Customer"}
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.service_type || "General"}
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
