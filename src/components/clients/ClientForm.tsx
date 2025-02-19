
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Client, ClientFormValues } from "./types"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
})

interface ClientFormProps {
  client?: Client
  onSuccess?: () => void
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: client ? {
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone_number: client.phone_number || "",
      address: client.address || "",
    } : {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      address: "",
    }
  })

  const onSubmit = async (values: ClientFormValues) => {
    try {
      // Clean up empty strings for optional fields
      const dataToUpdate = {
        ...values,
        phone_number: values.phone_number || null,
        address: values.address || null,
      }

      if (client) {
        console.log("Updating client with data:", dataToUpdate)
        const { error } = await supabase
          .from("clients")
          .update(dataToUpdate)
          .eq("id", client.id)

        if (error) throw error
      } else {
        console.log("Creating client with data:", dataToUpdate)
        const { error } = await supabase
          .from("clients")
          .insert(dataToUpdate)

        if (error) throw error
      }

      await queryClient.invalidateQueries({ queryKey: ["clients"] })
      
      toast({
        title: "Success",
        description: client ? "Client updated successfully" : "Client created successfully",
      })

      onSuccess?.()
    } catch (error: any) {
      console.error("Error saving client:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
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
              <FormLabel>Phone Number</FormLabel>
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {client ? "Update Client" : "Create Client"}
        </Button>
      </form>
    </Form>
  )
}
