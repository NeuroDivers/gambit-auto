
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
        // Use a simpler query first to check if we can access the table
        const { data: basicData, error: basicError } = await supabase
          .from("estimate_requests")
          .select("*")
        
        if (basicError) {
          console.error("Error fetching basic estimate requests:", basicError)
          toast.error("Error accessing estimate requests data")
          throw basicError
        }
        
        console.log("Basic estimate requests data:", basicData)
        
        if (basicData && basicData.length === 0) {
          console.log("No estimate requests found in the database query")
          setEstimateRequests([])
          setLoading(false)
          return
        }
        
        // Since we have records in the basic query, try fetching with customer relationship
        const { data, error } = await supabase
          .from("estimate_requests")
          .select(`
            *,
            customer:customers(first_name, last_name, email)
          `)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching estimate requests with customer join:", error)
          
          // Fall back to the basic data if the join fails
          if (basicData) {
            console.log("Using basic data as fallback since join failed")
            setEstimateRequests(basicData)
          } else {
            toast.error("Error loading estimate requests")
            throw error
          }
        } else {
          console.log("Fetched estimate requests with customer join:", data)
          setEstimateRequests(data || [])
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
