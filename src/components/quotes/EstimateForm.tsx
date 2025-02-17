
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuoteRequest } from "@/types/quote-request"
import { toast } from "sonner"

type EstimateFormProps = {
  quoteRequest: QuoteRequest
  services: any[]
  onSubmit: (estimates: Record<string, string>) => void
  isSubmitting: boolean
}

export function EstimateForm({ quoteRequest, services, onSubmit, isSubmitting }: EstimateFormProps) {
  const [estimates, setEstimates] = useState<Record<string, string>>(() => {
    const initialEstimates: Record<string, string> = {}
    quoteRequest.service_ids.forEach(id => {
      initialEstimates[id] = quoteRequest.service_estimates?.[id]?.toString() || ""
    })
    return initialEstimates
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that all services have estimates
    const hasAllEstimates = Object.values(estimates).every(value => value.trim() !== "")
    if (!hasAllEstimates) {
      toast.error("Please provide estimates for all services")
      return
    }

    // Validate that all estimates are valid numbers
    const hasInvalidEstimates = Object.values(estimates).some(value => {
      const num = parseFloat(value)
      return isNaN(num) || num <= 0
    })
    if (hasInvalidEstimates) {
      toast.error("Please provide valid amounts for all services")
      return
    }

    onSubmit(estimates)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provide Service Estimates</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {quoteRequest.service_ids.map((serviceId) => {
            const service = services?.find(s => s.id === serviceId)
            return service ? (
              <div key={serviceId} className="space-y-2">
                <Label htmlFor={serviceId}>{service.name}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id={serviceId}
                    type="number"
                    step="0.01"
                    min="0"
                    value={estimates[serviceId]}
                    onChange={(e) => setEstimates(prev => ({
                      ...prev,
                      [serviceId]: e.target.value
                    }))}
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            ) : null
          })}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Estimates"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
