
import { z } from "zod"
import type { ServiceDetails, ServiceItemType } from "@/types/quote-request"

const vehicleInfoSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900, "Year must be after 1900"),
  vin: z.string()
})

const serviceItemSchema = z.object({
  service_id: z.string().min(1, "Service is required"),
  service_name: z.string().min(1, "Service name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Price cannot be negative")
})

export const formSchema = z.object({
  vehicleInfo: vehicleInfoSchema,
  service_items: z.array(serviceItemSchema),
  description: z.string(),
  service_details: z.record(z.any())
})

export type QuoteRequestFormData = z.infer<typeof formSchema>
export type { ServiceItemType }
