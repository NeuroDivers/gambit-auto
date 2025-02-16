
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { ServiceItemsField } from "../form-fields/ServiceItemsField"
import { TimeSelectionFields } from "./TimeSelectionFields"
import { useFieldArray } from "react-hook-form"

interface FormSectionsProps {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ form, isSubmitting, isEditing }: FormSectionsProps) {
  const { fields: serviceItems, replace } = useFieldArray({
    control: form.control,
    name: "service_items"
  });

  const handleServicesChange = (updatedServices: any[]) => {
    console.log('Updating services in form:', updatedServices);
    replace(updatedServices.map(service => ({
      ...service,
      id: service.id || crypto.randomUUID()
    })));
  };

  return (
    <div className="space-y-6">
      <CustomerInfoFields 
        control={form.control}
        disabled={isSubmitting}
      />
      
      <VehicleInfoFields 
        control={form.control}
        watch={form.watch}
        setValue={form.setValue}
        disabled={isSubmitting}
      />

      <ServiceItemsField
        services={serviceItems}
        onServicesChange={handleServicesChange}
        disabled={isSubmitting}
      />

      <TimeSelectionFields 
        form={form}
        disabled={isSubmitting}
      />
    </div>
  );
}
