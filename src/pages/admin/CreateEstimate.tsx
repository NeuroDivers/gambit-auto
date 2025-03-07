import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { InvoiceFormValues } from "@/components/invoices/types";
import { useInvoiceMutation } from "@/components/invoices/hooks/useInvoiceMutation";
import { useCustomers } from "@/hooks/useCustomers";
import { useNavigate } from "react-router-dom";

export default function CreateEstimate() {
  const navigate = useNavigate();
  const { customers, isLoading: isLoadingCustomers } = useCustomers();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
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
      services: [],
    },
  });

  const { mutate: createInvoice, isLoading } = useInvoiceMutation();

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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Estimate"}
        </Button>
      </div>
    </form>
  );
}
