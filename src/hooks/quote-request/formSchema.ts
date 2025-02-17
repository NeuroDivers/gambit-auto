
import { z } from "zod"

export const formSchema = z.object({
  vehicleInfo: z.object({
    make: z.string(),
    model: z.string(),
    year: z.number(),
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

export type FormData = z.infer<typeof formSchema>
