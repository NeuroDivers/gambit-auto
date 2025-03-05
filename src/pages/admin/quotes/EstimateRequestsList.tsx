
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { toast } from "sonner"
import { useEstimateRequestsData } from "@/hooks/useEstimateRequestsData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

export function EstimateRequestsList() {
  const navigate = useNavigate()
  const [estimateRequests, setEstimateRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState(null)
  const { fetchEstimateRequests, createTestEstimateRequest } = useEstimateRequestsData()

  useEffect(() => {
    const loadEstimateRequests = async () => {
      try {
        setLoading(true)
        const { data, count, tableInfo, error } = await fetchEstimateRequests();
        
        // Prepare detailed debug info for troubleshooting
        const debugData = {
          rawData: data,
          count: data?.length || 0,
          tableInfo,
          error: error ? {
            message: error.message,
            hint: error.hint,
            code: error.code
          } : null,
          recordStats: data?.map(req => ({
            id: req.id,
            customerIdPresent: Boolean(req.customer_id),
            createdAt: req.created_at,
            status: req.status
          })) || [],
          timestamp: new Date().toISOString()
        };
        setDebugInfo(debugData);
        
        if (data && data.length > 0) {
          setEstimateRequests(data);
          
          // Customer data should already be joined in the query, but if it's missing
          // for some records, we can fetch it separately
          const missingCustomerIds = data
            .filter(req => req.customer_id && !req.customers)
            .map(req => req.customer_id);
          
          if (missingCustomerIds.length > 0) {
            const { data: customers, error: customerError } = await supabase
              .from("customers")
              .select("id, first_name, last_name, email")
              .in("id", missingCustomerIds);
            
            if (customerError) {
              console.error("Error fetching customer data:", customerError);
              toast.error("Could not load customer details");
            } else if (customers && customers.length > 0) {
              // Create a map of customer data by ID for quick lookup
              const customerMap = customers.reduce((map, customer) => {
                map[customer.id] = customer;
                return map;
              }, {});
              
              // Enhance the estimate requests with customer data
              const enhancedRequests = data.map(request => ({
                ...request,
                customers: request.customers || customerMap[request.customer_id] || null
              }));
              
              setEstimateRequests(enhancedRequests);
            }
          }
        } else {
          setEstimateRequests([]);
          
          if (error) {
            toast.error(`Error loading estimate requests: ${error.message}`);
          }
        }
      } catch (error) {
        console.error("Error in estimate requests fetch flow:", error);
        toast.error(`Failed to load estimate requests: ${error.message}`);
        setEstimateRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadEstimateRequests();
  }, []);

  const handleCreateTestRequest = async () => {
    const result = await createTestEstimateRequest();
    if (result) {
      // Refresh the list
      window.location.reload();
    }
  };

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
          <Card className="bg-yellow-50 p-4 mt-4 rounded border border-yellow-200">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Debug Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-xs mt-2">
                <p>Timestamp: {debugInfo.timestamp}</p>
                <p>Number of Records: {debugInfo.count}</p>
                <p>Row IDs: {debugInfo.recordStats?.map(r => r.id?.substring(0,8)).join(', ') || 'None'}</p>
                {debugInfo.tableInfo && (
                  <div className="mt-2">
                    <p>Table Info: {JSON.stringify(debugInfo.tableInfo, null, 2)}</p>
                  </div>
                )}
                {debugInfo.error && (
                  <div className="mt-2 text-red-600">
                    <p>Error: {debugInfo.error.message}</p>
                    <p>Code: {debugInfo.error.code}</p>
                    {debugInfo.error.hint && <p>Hint: {debugInfo.error.hint}</p>}
                  </div>
                )}
              </div>
              <pre className="text-xs mt-2 overflow-auto max-h-40 bg-white p-2 rounded">{JSON.stringify(debugInfo, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </div>

      {estimateRequests.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <h3 className="text-lg font-medium">No estimate requests yet</h3>
          <p className="text-muted-foreground mt-1 mb-6">
            Customers can submit estimate requests through your website
          </p>
          <Button 
            onClick={handleCreateTestRequest}
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
