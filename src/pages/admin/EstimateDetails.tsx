
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft, Printer, Send, Trash } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { CustomerInfo } from "@/components/estimates/sections/CustomerInfo"
import { VehicleInfo } from "@/components/estimates/sections/VehicleInfo"
import { EstimateServices } from "@/components/estimates/sections/EstimateServices"
import { EstimateNotes } from "@/components/estimates/sections/EstimateNotes"
import { EstimateStatus } from "@/components/estimates/sections/EstimateStatus"

export default function EstimateDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [estimate, setEstimate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Estimate Details | Auto Detailing CRM"
    
    const fetchEstimate = async () => {
      try {
        console.log('Fetching estimate with ID:', id)
        const { data, error } = await supabase
          .from("estimates")
          .select(`
            *,
            customer:customers!estimates_customers_id_fkey(*),
            vehicle:vehicles(*),
            items:estimate_items(*)
          `)
          .eq("id", id)
          .single()

        if (error) throw error
        console.log('Fetched estimate data:', data)
        setEstimate(data)
      } catch (error) {
        console.error("Error fetching estimate:", error)
        toast({
          variant: "destructive",
          title: "Failed to load estimate",
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEstimate()
    }
  }, [id, toast])

  if (loading) {
    return <LoadingScreen />
  }

  if (!estimate) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Estimate Not Found</h2>
        <p className="mb-6">The estimate you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/estimates")}>
          Back to Estimates
        </Button>
      </div>
    )
  }

  const handleDeleteEstimate = async () => {
    try {
      const { error } = await supabase
        .from("estimates")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Estimate deleted successfully",
      })
      navigate("/estimates")
    } catch (error) {
      console.error("Error deleting estimate:", error)
      toast({
        variant: "destructive",
        title: "Failed to delete estimate",
        description: error.message,
      })
    }
  }

  const handleSendEstimate = () => {
    // Implementation for sending email would go here
    toast({
      title: "Email feature coming soon",
      description: "The ability to email estimates will be available in a future update."
    })
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <PageTitle
              title={`Estimate #${estimate.estimate_number || estimate.id.substring(0, 8)}`}
              description={`Created on ${new Date(estimate.created_at).toLocaleDateString()}`}
            />
            <EstimateStatus status={estimate.status} />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEstimate}>
            <Send className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteEstimate}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <EstimateServices items={estimate.items} />
          <EstimateNotes notes={estimate.notes} />
        </div>
        <div className="space-y-6">
          <CustomerInfo customer={estimate.customer} />
          <VehicleInfo vehicle={estimate.vehicle} />
        </div>
      </div>
    </div>
  )
}
