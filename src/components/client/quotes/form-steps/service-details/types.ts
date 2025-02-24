
import { UseFormReturn } from "react-hook-form"
import { ServiceFormData } from "@/types/service-item"

export interface ServiceDetailFieldProps {
  form: UseFormReturn<ServiceFormData>
  serviceId: string
}

export interface ServiceImageUploadProps {
  images: string[]
  onImageUpload: (files: FileList) => Promise<string[]>
  onImageRemove: (url: string) => void
}
