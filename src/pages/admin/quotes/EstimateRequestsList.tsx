
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
        
        // First, check database tables and columns
        const { data: tableInfo, error: tableError } = await supabase
          .rpc('get_table_info')
        
        if (tableError) {
          console.error("Error checking table info:", tableError)
        } else {
          console.log("Table info:", tableInfo)
          setDebugInfo(tableInfo)
        }
        
        // Check if the table exists and has data
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
        
        if (count === 0) {
          // Try to insert a test record to see if we can write to the table
          const testData = {
            customer_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
            vehicle_make: 'Test Make',
            vehicle_model: 'Test Model',
            vehicle_year: 2023,
            status: 'pending',
            description: 'Test estimate request created from the UI to debug data fetching'
          }
          
          const { data: insertResult, error: insertError } = await supabase
            .from('estimate_requests')
            .insert(testData)
            .select()
          
          if (insertError) {
            console.error("Error inserting test record:", insertError)
            toast.error("Failed to create test record. Please check table permissions.")
          } else {
            console.log("Successfully inserted test record:", insertResult)
            toast.success("Created a test estimate request")
          }
        }
        
        // Now fetch the actual data - use a simpler query first without joins
        const { data: basicEstimateRequests, error: basicError } = await supabase
          .from("estimate_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30)
          
        if (basicError) {
          console.error("Error fetching basic estimate requests:", basicError)
        } else {
          console.log("Basic estimate requests data:", basicEstimateRequests)
          // Set the data from the simple query as a fallback
          setEstimateRequests(basicEstimateRequests || [])
        }
        
        // Try the query with explicit foreign key relation
        const { data: relationalRequests, error: relationalError } = await supabase
          .from("estimate_requests")
          .select(`
            id, 
            created_at, 
            status, 
            description,
            customer_id,
            vehicle_make,
            vehicle_model,
            vehicle_year,
            customers!estimate_requests_customer_id_fkey(first_name, last_name, email)
          `)
          .order("created_at", { ascending: false })
          .limit(30)
        
        if (relationalError) {
          console.error("Error fetching estimate requests with relations:", relationalError)
          // We already set the data from the simple query
        } else {
          console.log("Successfully fetched estimate requests with relations:", relationalRequests)
          setEstimateRequests(relationalRequests || [])
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
