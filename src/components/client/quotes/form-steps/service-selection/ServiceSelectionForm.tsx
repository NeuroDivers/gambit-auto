
import { useQuoteForm } from '../../providers/QuoteFormProvider'
import { ServiceItemType } from '@/types/service-item'
import { useState } from 'react'

interface ServiceSelectionFormProps {
  services: Array<{
    id: string
    name: string
    base_price: number
  }>
  disabled?: boolean
}

export function ServiceSelectionForm({ services, disabled }: ServiceSelectionFormProps) {
  const form = useQuoteForm()
  const [selectedServices, setSelectedServices] = useState<ServiceItemType[]>(
    form.getValues('service_items') || []
  )

  const handleServiceChange = (services: ServiceItemType[]) => {
    const validServices: ServiceItemType[] = services.map(service => ({
      service_id: service.service_id,
      service_name: service.service_name,
      quantity: service.quantity,
      unit_price: service.unit_price,
      commission_rate: service.commission_rate ?? null,
      commission_type: service.commission_type ?? null,
      description: service.description ?? ""
    }))
    
    setSelectedServices(validServices)
    form.setValue('service_items', validServices, { shouldValidate: true })
  }

  return (
    <div className="space-y-4">
      {/* Add service selection UI here */}
    </div>
  )
}
