
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useEffect } from "react"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { PlusCircle } from "lucide-react"

export function EstimatesList() {
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const { data, error } = await supabase
          .from("estimates")
          .select(`
            *,
            customer:customers(first_name, last_name, email)
          `)
          .order("created_at", { ascending: false })

        if (error) throw error
        setEstimates(data || [])
      } catch (error) {
        console.error("Error fetching estimates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEstimates()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Estimates</h2>
          <p className="text-muted-foreground">
            Create and manage customer estimates
          </p>
        </div>
        <Button onClick={() => navigate("/estimates/create")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
      </div>

      {estimates.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No estimates yet</h3>
          <p className="text-muted-foreground mt-1">
            Create your first estimate to get started
          </p>
          <Button onClick={() => navigate("/estimates/create")} className="mt-4">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Estimate
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium">
                    {estimate.estimate_number || `EST-${estimate.id.substring(0, 8)}`}
                  </TableCell>
                  <TableCell>
                    {estimate.customer 
                      ? `${estimate.customer.first_name} ${estimate.customer.last_name}`
                      : "Unknown Customer"}
                  </TableCell>
                  <TableCell>
                    {new Date(estimate.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    ${estimate.total?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={getStatusColor(estimate.status)}
                      variant="outline"
                    >
                      {estimate.status || "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/estimates/${estimate.id}`)}
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
