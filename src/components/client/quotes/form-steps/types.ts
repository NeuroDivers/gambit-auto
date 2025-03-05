
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "@/types/service-item";

export interface VehicleInfoStepProps {
  form: UseFormReturn<ServiceFormData>;
  onVehicleSave: (vehicleInfo: { 
    make: string; 
    model: string; 
    year: number; 
    vin: string; 
    saveToAccount?: boolean; 
  }) => Promise<void>;
}

export interface ServiceDetailsStepProps {
  form: UseFormReturn<ServiceFormData>;
  services: { id: string; name: string; base_price: number; description?: string; hierarchy_type?: string }[];
  serviceId: string | null;
  onImageUpload: (files: FileList) => Promise<string[]>;
  onImageRemove: (url: string) => void;
}

export interface SummaryStepProps {
  form: UseFormReturn<ServiceFormData>;
  services: { id: string; name: string; base_price: number }[];
}
