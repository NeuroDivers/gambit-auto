
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Client } from "./types"
import { clientFormSchema, ClientFormValues } from "./schemas/clientFormSchema"
import { ClientFormFields } from "./form/ClientFormFields"

type ClientFormProps = {
  client?: Client
  onSuccess?: () => void
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
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
    },
  })

  async function onSubmit(values: ClientFormValues) {
    try {
      if (client) {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update(values)
          .eq("id", client.id)

        if (error) throw error
        toast.success("Client updated successfully")
      } else {
        // Create new client
        const { error } = await supabase
          .from("clients")
          .insert(values)

        if (error) throw error
        toast.success("Client created successfully")
      }

      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving client:', error)
      toast.error("Failed to save client")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ClientFormFields form={form} />
        <Button type="submit" className="w-full">
          {client ? "Update Client" : "Create Client"}
        </Button>
      </form>
    </Form>
  )
}
