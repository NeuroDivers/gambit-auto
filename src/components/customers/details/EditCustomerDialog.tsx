
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Customer } from "../types";
import { customerFormSchema } from "../schemas/customerFormSchema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ClientFormFields } from "@/components/clients/form/ClientFormFields";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomerDialog({ customer, open, onOpenChange }: EditCustomerDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<typeof customerFormSchema._type>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      email: customer.email || "",
      phone_number: customer.phone_number || "",
      street_address: customer.street_address || "",
      unit_number: customer.unit_number || "",
      city: customer.city || "",
      state_province: customer.state_province || "",
      postal_code: customer.postal_code || "",
      country: customer.country || "",
      notes: customer.notes || "",
    },
  });

  const onSubmit = async (data: typeof customerFormSchema._type) => {
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          street_address: data.street_address,
          unit_number: data.unit_number,
          city: data.city,
          state_province: data.state_province,
          postal_code: data.postal_code,
          country: data.country,
          notes: data.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id);

      if (error) throw error;

      toast({
        title: "Customer updated",
        description: "Customer information has been updated successfully.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['customer', customer.id] });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "There was an error updating the customer.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ClientFormFields form={form} />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
