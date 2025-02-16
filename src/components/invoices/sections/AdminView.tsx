
import { InvoiceActions } from "./InvoiceActions"
import { Invoice } from "../types"
import { Tables } from "@/integrations/supabase/types"

type AdminViewProps = {
  invoice: Invoice | null
  businessProfile: Tables<'business_profile'> | null
  invoiceId?: string
  onPrint: () => void
}

export function AdminView({ 
  invoiceId,
  onPrint 
}: AdminViewProps) {
  return (
    <div className="space-y-6">
      <InvoiceActions
        invoiceId={invoiceId}
        onPrint={onPrint}
      />
    </div>
  )
}
