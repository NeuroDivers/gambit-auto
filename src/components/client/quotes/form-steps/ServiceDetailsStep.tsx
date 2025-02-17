import { UseFormReturn } from "react-hook-form"
import { motion } from "framer-motion"
import { QuoteRequestFormData } from "@/hooks/quote-request/formSchema"

type ServiceDetailsStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
  services: any[]
  serviceId: string
  onImageUpload: (files: FileList, serviceId: string) => Promise<void>
  onImageRemove: (url: string, serviceId: string) => void
}

export function ServiceDetailsStep({ 
  form, 
  services, 
  serviceId,
  onImageUpload,
  onImageRemove 
}: ServiceDetailsStepProps) {
  return null
}
