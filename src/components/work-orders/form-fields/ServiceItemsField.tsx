import { ServiceItemType } from '@/types/service-item'

interface ServiceItemsFieldProps {
  services: ServiceItemType[]
  onChange: (services: ServiceItemType[]) => void
  disabled?: boolean
}

export function ServiceItemsField({ services, onChange, disabled }: ServiceItemsFieldProps) {
  const handleAdd = (service: Partial<ServiceItemType>) => {
    const newService: ServiceItemType = {
      service_id: service.service_id || '',
      service_name: service.service_name || '',
      quantity: service.quantity || 1,
      unit_price: service.unit_price || 0,
      commission_rate: service.commission_rate || null,
      commission_type: service.commission_type || null,
      description: service.description || ''
    }
    onChange([...services, newService])
  }

  return (
    <div>Service Items Field</div>
  )
}
