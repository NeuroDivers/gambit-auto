
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Client } from "./types"
import { clientFormSchema, ClientFormValues } from "./schemas/clientFormSchema"
import { ClientFormFields } from "./form/ClientFormFields"
import { useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

type ClientFormProps = {
  client?: Client
  onSuccess?: () => void
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  console.log("Client data received:", client) // Debug log

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      first_name: client?.first_name || "",
      last_name: client?.last_name || "",
      email: client?.email || "",
      phone_number: client?.phone_number || "",
      unit_number: client?.unit_number || "",
      street_address: client?.street_address || "",
      city: client?.city || "",
      state_province: client?.state_province || "",
      postal_code: client?.postal_code || "",
      country: client?.country || "",
    }
  })

  // Reset form when client data changes
  useEffect(() => {
    if (client) {
      console.log("Setting form values with:", client)
      form.reset({
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        email: client.email || "",
        phone_number: client.phone_number || "",
        unit_number: client.unit_number || "",
        street_address: client.street_address || "",
        city: client.city || "",
        state_province: client.state_province || "",
        postal_code: client.postal_code || "",
        country: client.country || "",
      })
    }
  }, [client])

  async function onSubmit(values: ClientFormValues) {
    try {
      if (client?.id) {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone_number: values.phone_number,
            unit_number: values.unit_number,
            street_address: values.street_address,
            city: values.city,
            state_province: values.state_province,
            postal_code: values.postal_code,
            country: values.country,
          })
          .eq("id", client.id)

        if (error) throw error
        toast.success("Client updated successfully")
      } else {
        // Check if client exists by email
        const { data: existingClient, error: checkError } = await supabase
          .from("clients")
          .select("id")
          .eq("email", values.email)
          .maybeSingle()

        if (checkError) throw checkError

        if (existingClient) {
          // Update existing client found by email
          const { error } = await supabase
            .from("clients")
            .update({
              first_name: values.first_name,
              last_name: values.last_name,
              phone_number: values.phone_number,
              unit_number: values.unit_number,
              street_address: values.street_address,
              city: values.city,
              state_province: values.state_province,
              postal_code: values.postal_code,
              country: values.country,
            })
            .eq("id", existingClient.id)

          if (error) throw error
          toast.success("Client updated successfully")
        } else {
          // Create new client
          const { error } = await supabase
            .from("clients")
            .insert({
              first_name: values.first_name,
              last_name: values.last_name,
              email: values.email,
              phone_number: values.phone_number,
              unit_number: values.unit_number,
              street_address: values.street_address,
              city: values.city,
              state_province: values.state_province,
              postal_code: values.postal_code,
              country: values.country,
            })

          if (error) throw error
          toast.success("Client created successfully")
        }
      }

      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving client:', error)
      toast.error("Failed to save client")
    }
  }

  return (
    <ScrollArea className="h-[500px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
          <ClientFormFields form={form} />
          <Button type="submit" className="w-full">
            {client ? "Update Client" : "Create Client"}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  )
}
