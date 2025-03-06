
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { PlusCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "@/components/ui/use-toast"

export function EstimatesList() {
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    fetchEstimates()
  }, [debouncedSearchTerm])

  const fetchEstimates = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from("estimates")
        .select('*')
        .order("created_at", { ascending: false })
      
      // Apply search filter if search term exists
      if (debouncedSearchTerm) {
        query = query.or(
          `customer_first_name.ilike.%${debouncedSearchTerm}%,` +
          `customer_last_name.ilike.%${debouncedSearchTerm}%,` + 
          `customer_email.ilike.%${debouncedSearchTerm}%,` +
          `estimate_number.ilike.%${debouncedSearchTerm}%`
        )
      }

      const { data, error } = await query
      
      if (error) throw error
      
      setEstimates(data || [])
    } catch (error) {
      console.error("Error fetching estimates:", error)
      toast({
        variant: "destructive",
        title: "Error fetching estimates",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Map status to badge variant
  const getBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "draft"
      case "sent":
        return "sent"
      case "approved":
        return "accepted"
      case "rejected":
        return "rejected"
      case "expired":
        return "expired"
      default:
        return "draft"
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

      <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Search estimates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {loading ? (
        <LoadingScreen />
      ) : estimates.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No estimates found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm ? "Try a different search term or" : "Create your first estimate to get started"}
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
              {estimates?.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium">
                    {estimate.estimate_number || `EST-${estimate.id.substring(0, 8)}`}
                  </TableCell>
                  <TableCell>
                    {`${estimate.customer_first_name || ''} ${estimate.customer_last_name || ''}`}
                  </TableCell>
                  <TableCell>
                    {new Date(estimate.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    ${estimate.total?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(estimate.status)}>
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
