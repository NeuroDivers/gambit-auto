import { z } from "zod"

const businessHoursSchema = z.object({
  monday: z.string().optional(),
  tuesday: z.string().optional(),
  wednesday: z.string().optional(),
  thursday: z.string().optional(),
  friday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
})

export const businessFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  business_hours: businessHoursSchema,
  logo_url: z.string().optional(),
})

export type BusinessFormValues = z.infer<typeof businessFormSchema>