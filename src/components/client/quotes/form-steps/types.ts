
import { ServiceFormData, ServiceItemType } from "@/types/service-item"
import { UseFormReturn } from "react-hook-form"

export interface FormStepProps {
  form: UseFormReturn<ServiceFormData>
}

export interface VehicleInfoStepProps extends FormStepProps {
  onVehicleSave?: (vehicleInfo: ServiceFormData['vehicleInfo']) => Promise<void>
}

export interface ServiceDetailsStepProps extends FormStepProps {
  services: any[]
  serviceId: string
  onImageUpload: (files: FileList) => Promise<string[]>
  onImageRemove: (url: string) => void
}

export interface SummaryStepProps extends FormStepProps {
  services: any[]
}

export interface FormNavigationProps {
  step: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  isSubmitting: boolean
  uploading: boolean
}
