
import * as z from "zod"

export const customerFormSchema = z.object({
  customer_first_name: z.string().min(1, "First name is required"),
  customer_last_name: z.string().min(1, "Last name is required"),
  customer_email: z.string().email("Invalid email address"),
  customer_phone_number: z.string().optional(),
  customer_unit_number: z.string().optional(),
  customer_street_address: z.string().optional(),
  customer_city: z.string().optional(),
  customer_state_province: z.string().optional(),
  customer_postal_code: z.string().optional(),
  customer_country: z.string().optional(),
  notes: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>
