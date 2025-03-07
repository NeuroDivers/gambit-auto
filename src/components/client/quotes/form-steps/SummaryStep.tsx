import { UseFormReturn } from 'react-hook-form';
import { ServiceFormData, ServiceItemType } from '@/types/service-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface SummaryStepProps {
  form: UseFormReturn<ServiceFormData>;
  services: ServiceItemType[];
}

export function SummaryStep({ form, services }: SummaryStepProps) {
  const { getValues } = form;
  const formValues = getValues();
  const vehicleInfo = formValues.vehicleInfo;
  
  // Calculate total price
  const totalPrice = services.reduce((total, service) => {
    return total + (service.unit_price * service.quantity);
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Your Quote Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vehicle Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Make</p>
                <p className="font-medium">{vehicleInfo?.make || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Model</p>
                <p className="font-medium">{vehicleInfo?.model || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Year</p>
                <p className="font-medium">{vehicleInfo?.year || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">VIN</p>
                <p className="font-medium">{vehicleInfo?.vin || 'Not specified'}</p>
              </div>
              {vehicleInfo?.color && (
                <div>
                  <p className="text-muted-foreground">Color</p>
                  <p className="font-medium">{vehicleInfo.color}</p>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Services */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Requested Services</h3>
            {services.length > 0 ? (
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {index + 1}
                          </Badge>
                          <h4 className="font-medium">{service.service_name}</h4>
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(service.unit_price * service.quantity)}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.quantity} × {formatCurrency(service.unit_price)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Sub-services if any */}
                    {service.sub_services && service.sub_services.length > 0 && (
                      <div className="mt-3 pl-6 border-l space-y-2">
                        {service.sub_services.map((subService, subIndex) => (
                          <div key={subIndex} className="flex justify-between items-center text-sm">
                            <div>
                              <p>{subService.service_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(subService.unit_price * subService.quantity)}</p>
                              <p className="text-xs text-muted-foreground">
                                {subService.quantity} × {formatCurrency(subService.unit_price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-2 font-medium">
                  <p>Estimated Total</p>
                  <p>{formatCurrency(totalPrice)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No services selected</p>
            )}
          </div>
          
          <Separator />
          
          {/* Additional Notes */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Additional Notes</h3>
            <p className="text-sm">
              {formValues.description || 'No additional notes provided.'}
            </p>
          </div>
          
          {/* Images if any */}
          {formValues.images && formValues.images.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Uploaded Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {formValues.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={image} 
                        alt={`Uploaded image ${index + 1}`} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="text-muted-foreground">
          By submitting this request, our team will review your information and provide you with a detailed quote. 
          We may contact you for additional details if needed.
        </p>
      </div>
    </div>
  );
}
