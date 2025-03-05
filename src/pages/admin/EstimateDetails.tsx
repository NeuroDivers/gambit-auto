
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft, Printer, Send, Trash } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

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
        const { data, error } = await supabase
          .from("estimates")
          .select(`
            *,
            customer:customers(*),
            vehicle:vehicles(*),
            items:estimate_items(*)
          `)
          .eq("id", id)
          .single()

        if (error) throw error
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
          <PageTitle
            title={`Estimate #${estimate.estimate_number || estimate.id}`}
            description={`Created on ${new Date(estimate.created_at).toLocaleDateString()}`}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="destructive" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Estimate content would go here */}
      <div className="border rounded-lg p-6">
        <p>Estimate details implementation needed</p>
      </div>
    </div>
  )
}
