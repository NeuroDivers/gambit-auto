
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "./types"
import { motion } from "framer-motion"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"

type ServiceSelectionStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
}

export function ServiceSelectionStep({ form }: ServiceSelectionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <ServiceSelectionField form={form} />
    </motion.div>
  )
}
