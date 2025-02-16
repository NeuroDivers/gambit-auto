import { InvoiceActions } from "./InvoiceActions";
import { InvoicePrintPreview } from "./InvoicePrintPreview";
import { PaymentSection } from "./PaymentSection";
import { Invoice } from "../types";
import { Tables } from "@/integrations/supabase/types";
type AdminViewProps = {
  invoice: Invoice | null;
  businessProfile: Tables<'business_profile'> | null;
  invoiceId?: string;
  onPrint: () => void;
};
export function AdminView({
  invoice,
  businessProfile,
  invoiceId,
  onPrint
}: AdminViewProps) {
  return;
}