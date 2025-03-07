
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
      customer_first_name: customer.customer_first_name || "",
      customer_last_name: customer.customer_last_name || "",
      customer_email: customer.customer_email || "",
      customer_phone: customer.customer_phone || "",
      customer_street_address: customer.customer_street_address || "",
      customer_unit_number: customer.customer_unit_number || "",
      customer_city: customer.customer_city || "",
      customer_state_province: customer.customer_state_province || "",
      customer_postal_code: customer.customer_postal_code || "",
      customer_country: customer.customer_country || "",
      notes: customer.notes || "",
    },
  });

  const onSubmit = async (data: typeof customerFormSchema._type) => {
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          customer_first_name: data.customer_first_name,
          customer_last_name: data.customer_last_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_street_address: data.customer_street_address,
          customer_unit_number: data.customer_unit_number,
          customer_city: data.customer_city,
          customer_state_province: data.customer_state_province,
          customer_postal_code: data.customer_postal_code,
          customer_country: data.customer_country,
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
