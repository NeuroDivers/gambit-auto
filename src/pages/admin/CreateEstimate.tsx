
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { InvoiceFormValues } from "@/components/invoices/types";
import { useInvoiceMutation } from "@/components/invoices/hooks/useInvoiceMutation";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function CreateEstimate() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true);
        const { data, error } = await supabase
          .from('customers')
          .select('*');
        
        if (error) throw error;
        setCustomers(data || []);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      invoice_items: [],
      status: "draft",
      total: 0,
    },
  });

  const { mutate: createInvoice, isPending } = useInvoiceMutation();

  const onSubmit = async (values: InvoiceFormValues) => {
    await createInvoice(values);
    navigate("/admin/estimates");
  };

  useEffect(() => {
    if (selectedClientId) {
      const selectedCustomer = customers.find(customer => customer.id === selectedClientId);
      if (selectedCustomer) {
        form.setValue("customer_first_name", selectedCustomer.first_name);
        form.setValue("customer_last_name", selectedCustomer.last_name);
        form.setValue("customer_email", selectedCustomer.email);
        form.setValue("customer_phone", selectedCustomer.phone);
        form.setValue("customer_address", selectedCustomer.address);
      }
    }
  }, [selectedClientId, customers, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="client">Select Client</label>
        <select
          id="client"
          onChange={(e) => setSelectedClientId(e.target.value)}
          disabled={isLoadingCustomers}
        >
          <option value="">Select a client</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.first_name} {customer.last_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" {...form.register("notes")} />
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <select id="status" {...form.register("status")}>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Estimate"}
        </Button>
      </div>
    </form>
  );
}
