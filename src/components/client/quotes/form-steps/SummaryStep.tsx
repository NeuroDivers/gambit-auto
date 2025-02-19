
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "@/types/quote-request"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

type SummaryStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
  services: any[]
}

export function SummaryStep({ form, services }: SummaryStepProps) {
  const { watch } = form
  const values = watch()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Review Your Quote Request</h2>
        <Alert variant="warning" className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Prices shown are starting from estimates. Final pricing may vary based on vehicle condition and specific requirements.
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-base font-medium">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Make:</span>{" "}
                <span className="font-medium">{values.vehicleInfo.make}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Model:</span>{" "}
                <span className="font-medium">{values.vehicleInfo.model}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Year:</span>{" "}
                <span className="font-medium">{values.vehicleInfo.year}</span>
              </div>
              {values.vehicleInfo.vin && (
                <div>
                  <span className="text-muted-foreground">VIN:</span>{" "}
                  <span className="font-medium">{values.vehicleInfo.vin}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-medium">Selected Services</h3>
            <div className="space-y-2">
              {values.service_items.map((item, index) => {
                const service = services?.find(s => s.id === item.service_id)
                const details = values.service_details[item.service_id]
                
                return (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{service?.name}</h4>
                        {details?.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {details.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-right">
                        <div>Quantity: {item.quantity}</div>
                        {item.unit_price > 0 && (
                          <div>
                            <span className="text-muted-foreground">Starting from: </span>
                            <span className="font-medium">${item.unit_price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {details?.images && details.images.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Attached Images:</div>
                        <div className="flex flex-wrap gap-2">
                          {details.images.map((url, imageIndex) => (
                            <img
                              key={imageIndex}
                              src={url}
                              alt={`Service ${index + 1} image ${imageIndex + 1}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {values.description && (
            <div className="space-y-2">
              <h3 className="text-base font-medium">Additional Notes</h3>
              <p className="text-sm text-muted-foreground">
                {values.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
