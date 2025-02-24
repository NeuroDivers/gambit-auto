
import * as z from "zod"

export const roleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nicename: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  can_be_assigned_to_bay: z.boolean().default(false),
  default_dashboard: z.enum(["admin", "staff", "client"]).default("client")
})

export type RoleFormValues = z.infer<typeof roleFormSchema>
