
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Quote, QuoteFormValues } from "../types"
import { useQuoteSubmission } from "./useQuoteSubmission"

const formSchema = z.object({
  customer_first_name: z.string().min(1, "First name is required"),
  customer_last_name: z.string().min(1, "Last name is required"),
  customer_email: z.string().email("Invalid email address"),
  customer_phone: z.string().min(1, "Phone number is required"),
  customer_address: z.string().optional(),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_vin: z.string().min(1, "Vehicle VIN is required"),
  notes: z.string().optional(),
  status: z.string(),
  service_items: z.array(z.object({
    service_id: z.string().optional(),
    service_name: z.string(),
    description: z.string().optional(),
    quantity: z.number(),
    unit_price: z.number()
  }))
})

interface UseQuoteFormProps {
  quote?: Quote
  defaultValues?: QuoteFormValues
  onSuccess?: () => void
}

export function useQuoteForm({ quote, defaultValues, onSuccess }: UseQuoteFormProps = {}) {
  const { submitQuote } = useQuoteSubmission()

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      customer_first_name: '',
      customer_last_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: '',
      notes: '',
      status: 'draft',
      service_items: []
    }
  })

  const onSubmit = async (values: QuoteFormValues) => {
    const success = await submitQuote(values, quote?.id)
    if (success) {
      onSuccess?.()
    }
  }

  return {
    form,
    onSubmit
  }
}
