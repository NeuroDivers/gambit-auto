
import { z } from "zod"

export const businessFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  light_logo_url: z.string().url().optional().or(z.literal("")),
  dark_logo_url: z.string().url().optional().or(z.literal("")),
})

export type BusinessFormValues = z.infer<typeof businessFormSchema>

export interface UserProfile {
  role: {
    id: string
    name: string
  } | null
}
