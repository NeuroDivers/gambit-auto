import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { toast } from "sonner"
import { useEstimateRequestsData } from "@/hooks/useEstimateRequestsData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { getQuoteStatusVariant } from "@/components/shared/BadgeVariants"

export function EstimateRequestsList() {
  const navigate = useNavigate()
  const [estimateRequests, setEstimateRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { fetchEstimateRequests, createTestEstimateRequest } = useEstimateRequestsData()

  useEffect(() => {
    const loadEstimateRequests = async () => {
      try {
        setLoading(true)
        const { data, count, tableInfo, error } = await fetchEstimateRequests();
        
        if (data && data.length > 0) {
          setEstimateRequests(data);
          
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
              const customerMap = customers.reduce((map, customer) => {
                map[customer.id] = customer;
                return map;
              }, {});
              
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
      window.location.reload();
    }
  };

  if (loading) {
    return <LoadingScreen />
  }

  const getBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "estimate_pending"
      case "estimated":
      case "in_progress":
        return "in_progress"
      case "accepted":
      case "completed":
        return "accepted"
      case "rejected":
      case "cancelled":
        return "rejected"
      case "expired":
        return "expired"
      default:
        return "estimate_pending"
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
                    <Badge variant={getQuoteStatusVariant(request.status)}>
                      {request.status.replace('_', ' ')}
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
