
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

  // For clients viewing an existing estimate
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

  // For admins creating an estimate
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Create Estimate</h3>
      {quoteRequest.service_ids.map(serviceId => (
        <div key={serviceId} className="flex items-center gap-4">
          <span className="flex-1">{getServiceName(serviceId)}</span>
          <div className="w-32">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={serviceEstimates[serviceId] || ""}
              onChange={(e) => handleEstimateChange(serviceId, e.target.value)}
              placeholder="Enter amount"
            />
          </div>
        </div>
      ))}
      
      <div className="flex justify-between items-center text-lg font-semibold pt-4 border-t">
        <span>Total:</span>
        <span>${calculateTotal().toFixed(2)}</span>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSubmitEstimate}
          disabled={isSubmitting || calculateTotal() <= 0}
        >
          Submit Estimate
        </Button>
      </div>
    </div>
  )
}
