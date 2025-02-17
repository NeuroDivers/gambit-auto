
import { z } from "zod"

export const formSchema = z.object({
  vehicleInfo: z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.number().min(1900, "Year must be after 1900"),
    vin: z.string()
  }),
  service_items: z.array(z.object({
    service_id: z.string(),
    service_name: z.string(),
    quantity: z.number(),
    unit_price: z.number()
  })),
  description: z.string(),
  service_details: z.record(z.any())
})

export type ServiceItemType = {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
}

export type QuoteRequestFormData = {
  vehicleInfo: {
    make: string
    model: string
    year: number
    vin: string
  }
  service_items: ServiceItemType[]
  description: string
  service_details: Record<string, any>
}
