
import { ReactNode } from "react"
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

export interface FormNavigationProps {
  step: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  isSubmitting: boolean
  uploading: boolean
}
