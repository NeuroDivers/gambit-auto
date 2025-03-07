
import { useParams } from "react-router-dom"
import { InvoiceView } from "@/components/invoices/InvoiceView"
import { PageTitle } from "@/components/shared/PageTitle"
import { useInvoiceSubscription } from "@/hooks/useInvoiceSubscription"

export default function EditInvoice() {
  const { id } = useParams()
  
  // Set up global invoice subscription
  useInvoiceSubscription()

  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="Edit Invoice"
        description="Modify invoice details and services"
      />
      <InvoiceView invoiceId={id} isEditing={true} />
    </div>
  )
}
