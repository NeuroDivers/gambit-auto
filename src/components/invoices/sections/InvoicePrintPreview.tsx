import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { InvoiceCard } from "./InvoiceCard"
import { InvoiceActions } from './InvoiceActions'

type InvoicePrintPreviewProps = {
  invoice: any
  invoiceId?: string
}

export function InvoicePrintPreview({ invoice, invoiceId }: InvoicePrintPreviewProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    onAfterPrint: () => console.log('Printed successfully'),
    content: () => componentRef.current,
  })

  return (
    <div className="w-full max-w-[1000px] mx-auto space-y-6 p-6">
      <InvoiceActions 
        invoiceId={invoiceId} 
        onPrint={handlePrint}
      />
      <div ref={componentRef} className="bg-white rounded-lg shadow-lg p-8">
        <InvoiceCard invoice={invoice} />
      </div>
    </div>
  )
}