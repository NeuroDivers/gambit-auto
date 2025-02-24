
import { ServiceItemsField } from '../form-fields/ServiceItemsField'

export function FormSections({ services, onChange, disabled, showCommission }: any) {
  return (
    <div>
      <ServiceItemsField
        services={services}
        onChange={onChange} // Changed from onServicesChange to onChange
        disabled={disabled}
        showCommission={showCommission}
      />
    </div>
  )
}
