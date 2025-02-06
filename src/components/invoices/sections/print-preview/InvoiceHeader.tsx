import { Invoice } from "../../types"

type InvoiceHeaderProps = {
  invoice: Invoice
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div className="text-right space-y-2">
      <h2 className="text-2xl font-bold text-purple-500">FACTURE / INVOICE</h2>
      {invoice.status && (
        <div className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 inline-block uppercase">
          {invoice.status}
        </div>
      )}
      <div className="text-sm text-gray-600 space-y-1">
        <p>No. de facture / Invoice #: {invoice.invoice_number}</p>
        <p>Date d'émission / Issue Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
        {invoice.due_date && (
          <p>Date d'échéance / Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  )
}