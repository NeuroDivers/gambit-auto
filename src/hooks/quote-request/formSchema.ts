
import { z } from "zod"
import type { ServiceDetails } from "@/components/client/quotes/form-steps/types"

const vehicleInfoSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900, "Year must be after 1900"),
  vin: z.string()
})

const serviceItemSchema = z.object({
  service_id: z.string(),
  service_name: z.string(),
  quantity: z.number(),
  unit_price: z.number()
})

export const formSchema = z.object({
  vehicleInfo: vehicleInfoSchema,
  service_items: z.array(serviceItemSchema),
  description: z.string(),
  service_details: z.record(z.any())
})

export type ServiceItemType = z.infer<typeof serviceItemSchema>
export type QuoteRequestFormData = {
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    vin: string;
  };
  service_items: ServiceItemType[];
  description: string;
  service_details: ServiceDetails;
}
