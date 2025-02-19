
import React from "react"
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Building, Mail, Phone, MapPin } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { BusinessFormValues } from "../schemas/businessFormSchema"

interface ContactInfoFieldsProps {
  form: UseFormReturn<BusinessFormValues>
}

export function ContactInfoFields({ form }: ContactInfoFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="company_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Building className="h-4 w-4 text-[#9b87f5]" />
              Company Name
            </FormLabel>
            <FormDescription>
              The official name of your business
            </FormDescription>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#9b87f5]" />
              Business Email
            </FormLabel>
            <FormDescription>
              Your primary business contact email
            </FormDescription>
            <FormControl>
              <Input {...field} type="email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#9b87f5]" />
              Business Phone
            </FormLabel>
            <FormDescription>
              Your primary business contact number
            </FormDescription>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#9b87f5]" />
              Business Address
            </FormLabel>
            <FormDescription>
              Your business's physical location
            </FormDescription>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
