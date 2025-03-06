
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuoteFormContext } from "../providers/QuoteFormProvider"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Car, FileText, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ServiceItemType } from "@/types/service-item"

export function SummaryStep() {
  const { formData } = useQuoteFormContext()
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalEstimate, setTotalEstimate] = useState(0)

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true)
      
      try {
        // Convert service_items to an array of service_ids
        const serviceIds = formData.service_items?.map(service => {
          if (typeof service === 'string') {
            return service;
          }
          return (service as ServiceItemType).service_id;
        }).filter(Boolean) || []
        
        if (serviceIds.length === 0) {
          setServices([])
          setIsLoading(false)
          return
        }
        
        const { data, error } = await supabase
          .from('service_types')
          .select('id, name, base_price, description')
          .in('id', serviceIds)
        
        if (error) {
          console.error('Error fetching services:', error)
          throw error
        }
        
        // Map the services with quantity from formData
        const servicesWithQuantity = data.map(service => {
          const serviceItem = formData.service_items?.find(item => {
            if (typeof item === 'string') {
              return item === service.id;
            }
            return (item as ServiceItemType).service_id === service.id;
          })
          
          const quantity = typeof serviceItem === 'string' 
            ? 1 
            : (serviceItem as ServiceItemType)?.quantity || 1
            
          const unitPrice = typeof serviceItem === 'string'
            ? service.base_price
            : (serviceItem as ServiceItemType)?.unit_price || service.base_price
            
          return {
            ...service,
            quantity,
            unitPrice,
            total: quantity * unitPrice
          }
        })
        
        setServices(servicesWithQuantity)
        
        // Calculate total estimate
        const total = servicesWithQuantity.reduce((sum, service) => sum + service.total, 0)
        setTotalEstimate(total)
      } catch (error) {
        console.error('Error in fetchServices:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchServices()
  }, [formData.service_items])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Quote Request Summary</h2>
        <p className="text-muted-foreground">
          Review your quote request details before submitting
        </p>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <span>Vehicle Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.vehicleInfo ? (
              <dl className="grid grid-cols-2 gap-y-3">
                <dt className="font-medium text-muted-foreground">Make:</dt>
                <dd>{formData.vehicleInfo.make}</dd>
                
                <dt className="font-medium text-muted-foreground">Model:</dt>
                <dd>{formData.vehicleInfo.model}</dd>
                
                <dt className="font-medium text-muted-foreground">Year:</dt>
                <dd>{formData.vehicleInfo.year}</dd>
                
                {formData.vehicleInfo.vin && (
                  <>
                    <dt className="font-medium text-muted-foreground">VIN:</dt>
                    <dd className="break-all">{formData.vehicleInfo.vin}</dd>
                  </>
                )}
                
                {formData.vehicleInfo.color && (
                  <>
                    <dt className="font-medium text-muted-foreground">Color:</dt>
                    <dd>{formData.vehicleInfo.color}</dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="text-muted-foreground">No vehicle information provided</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Service Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Service Type</h4>
                <p>{formData.service_type || "Not specified"}</p>
              </div>
              
              {formData.description && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Additional Information</h4>
                  <p className="text-sm whitespace-pre-wrap">{formData.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Requested Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading services...</p>
          ) : services.length > 0 ? (
            <div className="space-y-4">
              <div className="divide-y">
                {services.map(service => (
                  <div key={service.id} className="py-3 grid grid-cols-12 gap-2">
                    <div className="col-span-6 md:col-span-7">
                      <p className="font-medium">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      )}
                    </div>
                    <div className="col-span-2 md:col-span-1 text-right">
                      <p>x{service.quantity}</p>
                    </div>
                    <div className="col-span-4 md:col-span-4 text-right">
                      <p className="font-medium">${service.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">${service.unitPrice.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-3 border-t flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-medium">Estimated Total</span>
                </div>
                <p className="text-lg font-bold">${totalEstimate.toFixed(2)}</p>
              </div>
              
              <p className="text-sm text-muted-foreground italic">
                * This is an estimate only. Final pricing will be confirmed after review.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No services selected</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
