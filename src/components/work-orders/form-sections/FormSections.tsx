import { CustomerInfoFields } from "./CustomerInfoFields";
import { VehicleInfoFields } from "./VehicleInfoFields";
import { SchedulingFields } from "./SchedulingFields";
import { BayAssignmentField } from "./BayAssignmentField";
import { AdditionalNotesField } from "./AdditionalNotesField";
import { WorkOrderFormProps } from "../types";
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FormSectionsProps {
  onSubmit: () => void;
  customer: any;
  onCustomerChange: (customer: any) => void;
  vehicleInfo: any;
  onVehicleInfoChange: (vehicleInfo: any) => void;
  scheduleInfo: any;
  onScheduleInfoChange: (scheduleInfo: any) => void;
  bayId: string | null;
  onBayIdChange: (bayId: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  services: any[];
  onServicesChange: (services: any[]) => void;
  isCreating: boolean;
  isSubmitting: boolean;
}

export function FormSections({
  onSubmit,
  customer,
  onCustomerChange,
  vehicleInfo,
  onVehicleInfoChange,
  scheduleInfo,
  onScheduleInfoChange,
  bayId,
  onBayIdChange,
  notes,
  onNotesChange,
  services,
  onServicesChange,
  isCreating,
  isSubmitting,
}: FormSectionsProps) {
  return (
    <div className="space-y-6">
      <CustomerInfoFields
        customerId={customer?.id}
        onSelectCustomer={onCustomerChange}
      />

      <VehicleInfoFields
        customerId={customer?.id}
        vehicleInfo={vehicleInfo}
        onChange={onVehicleInfoChange}
      />

      <SchedulingFields
        value={scheduleInfo}
        onChange={onScheduleInfoChange}
      />

      <BayAssignmentField
        value={bayId}
        onChange={onBayIdChange}
      />

      <AdditionalNotesField
        value={notes}
        onChange={onNotesChange}
      />

      <ServiceSelectionField
        services={services}
        onChange={onServicesChange}
      />
    </div>
  );
}
