
import { z } from "zod"
import type { ServiceDetails } from "@/types/quote-request"

export interface ServiceItemType {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
  commission_rate: number | null
  commission_type: 'percentage' | 'flat' | null
  description?: string // Added to make it compatible with InvoiceItem
}

const vehicleInfoSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900, "Year must be after 1900"),
  vin: z.string(),
  saveToAccount: z.boolean().optional()
}).required()

const serviceItemSchema = z.object({
  service_id: z.string().min(1, "Service is required"),
  service_name: z.string().min(1, "Service name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Price cannot be negative"),
  commission_rate: z.number().nullable(),
  commission_type: z.enum(['percentage', 'flat']).nullable(),
  description: z.string().optional()
}).required()

export const formSchema = z.object({
  vehicleInfo: vehicleInfoSchema,
  service_items: z.array(serviceItemSchema),
  description: z.string(),
  service_details: z.record(z.any())
}).required()

export type QuoteRequestFormData = z.infer<typeof formSchema>
