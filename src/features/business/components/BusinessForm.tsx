
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { businessFormSchema, BusinessFormValues } from "../schemas/businessFormSchema"
import { Building, Mail, Phone, MapPin, Image } from "lucide-react"

interface BusinessFormProps {
  businessProfile: any
}

export function BusinessForm({ businessProfile }: BusinessFormProps) {
  const { toast } = useToast()
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      company_name: "",
      email: "",
      phone_number: "",
      address: "",
      logo_url: "",
    }
  })

  React.useEffect(() => {
    if (businessProfile) {
      form.reset({
        company_name: businessProfile.company_name || "",
        email: businessProfile.email || "",
        phone_number: businessProfile.phone_number || "",
        address: businessProfile.address || "",
        logo_url: businessProfile.logo_url || "",
      })
    }
  }, [businessProfile, form])

  async function onSubmit(values: BusinessFormValues) {
    try {
      const { error } = businessProfile 
        ? await supabase
            .from("business_profile")
            .update(values)
            .eq("id", businessProfile.id)
        : await supabase
            .from("business_profile")
            .insert([values])

      if (error) throw error

      toast({
        title: "Success",
        description: "Business profile updated successfully.",
      })
    } catch (error) {
      console.error("Error updating business profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error updating the business profile.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Input {...field} className="bg-white" />
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
                <Input {...field} type="email" className="bg-white" />
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
                <Input {...field} className="bg-white" />
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
                <Input {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Image className="h-4 w-4 text-[#9b87f5]" />
                Logo URL
              </FormLabel>
              <FormDescription>
                A URL to your business logo image
              </FormDescription>
              <FormControl>
                <Input {...field} type="url" placeholder="https://" className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
        >
          Save Changes
        </Button>
      </form>
    </Form>
  )
}
