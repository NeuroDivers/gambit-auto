
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import type { QuoteRequest } from "@/types/quote-request"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

type EstimateDetailsProps = {
  quoteRequest: QuoteRequest
  getServiceName: (serviceId: string) => string
  onAcceptEstimate: () => void
  onRejectEstimate: () => void
}

export function EstimateDetails({ 
  quoteRequest, 
  getServiceName, 
  onAcceptEstimate, 
  onRejectEstimate 
}: EstimateDetailsProps) {
  const [serviceEstimates, setServiceEstimates] = useState<Record<string, number>>(
    quoteRequest.service_estimates || {}
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEstimateChange = (serviceId: string, value: string) => {
    const numericValue = parseFloat(value) || 0
    setServiceEstimates(prev => ({
      ...prev,
      [serviceId]: numericValue
    }))
  }

  const calculateTotal = () => {
    return Object.values(serviceEstimates).reduce((sum, value) => sum + value, 0)
  }

  const handleSubmitEstimate = async () => {
    try {
      setIsSubmitting(true)
      
      const { error } = await supabase
        .from('quote_requests')
        .update({
          service_estimates: serviceEstimates,
          estimated_amount: calculateTotal(),
          status: 'estimated'
        })
        .eq('id', quoteRequest.id)

      if (error) throw error

      toast.success("Estimate submitted successfully")
    } catch (error) {
      console.error('Error submitting estimate:', error)
      toast.error("Failed to submit estimate")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Only show estimate details if an estimate exists
  if (quoteRequest.status === "estimated") {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Estimate Details</h3>
        {Object.entries(quoteRequest.service_estimates || {}).map(([serviceId, amount]) => (
          <div key={serviceId} className="flex justify-between items-center">
            <span>{getServiceName(serviceId)}</span>
            <span className="font-medium">${String(amount)}</span>
          </div>
        ))}
        <div className="mt-4 flex justify-between items-center text-lg font-semibold">
          <span>Total Estimate:</span>
          <span>${quoteRequest.estimated_amount}</span>
        </div>

        {quoteRequest.client_response ? (
          <div className="mt-4 flex items-center gap-2">
            <Badge 
              variant={quoteRequest.client_response === "accepted" ? "outline" : "destructive"}
              className="flex items-center gap-1"
            >
              {quoteRequest.client_response === "accepted" ? (
                <>
                  <Check className="h-3 w-3" />
                  Quote Accepted
                </>
              ) : (
                <>
                  <X className="h-3 w-3" />
                  Quote Rejected
                </>
              )}
            </Badge>
          </div>
        ) : (
          <div className="mt-4 flex gap-4 justify-end">
            <Button onClick={onAcceptEstimate}>
              Accept Quote
            </Button>
            <Button
              variant="destructive"
              onClick={onRejectEstimate}
            >
              Decline Quote
            </Button>
          </div>
        )}
      </div>
    )
  }

  // If there's no estimate and user is a client, show waiting message
  if (!quoteRequest.status || quoteRequest.status === "pending") {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Estimate Status</h3>
        <p className="text-muted-foreground">Waiting for estimate from service provider...</p>
      </div>
    )
  }

  // Create estimate section - only shown to admins, not visible to clients
  return null
}
