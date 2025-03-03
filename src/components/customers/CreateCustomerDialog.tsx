
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useQueryClient } from "@tanstack/react-query"

interface CreateCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const customerFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

export function CreateCustomerDialog({ open, onOpenChange }: CreateCustomerDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      street_address: "",
      city: "",
      state_province: "",
      postal_code: "",
    },
  })

  const handleSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true)
    try {
      // First create profile
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert([{
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
        }])
        .select()
        .single()

      if (profileError) throw profileError
      
      // Now create customer linked to profile
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert([{
          profile_id: newProfile.id,
          street_address: data.street_address,
          city: data.city,
          state_province: data.state_province,
          postal_code: data.postal_code,
        }])
        .select()
        .single()

      if (customerError) throw customerError

      // Show success message
      toast.success("Customer created successfully")
      
      // Close the dialog
      onOpenChange(false)
      
      // Reset the form
      form.reset()
      
      // Invalidate queries to refresh the customer list
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customerStats'] })

    } catch (error) {
      console.error("Error creating customer:", error)
      toast.error("Failed to create customer")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
              name="street_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state_province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Customer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
