import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { InvoiceCard } from './InvoiceCard'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

type InvoicePrintPreviewProps = {
  invoice: any
}

export function InvoicePrintPreview({ invoice }: InvoicePrintPreviewProps) {
  const componentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    onAfterPrint: () => console.log('Printed successfully'),
    removeAfterPrint: true,
    pageStyle: "@page { size: auto; margin: 20mm; }",
  })

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handlePrint && handlePrint()} className="gap-2">
          <Printer className="w-4 h-4" />
          Print Invoice
        </Button>
      </div>
      <div ref={componentRef}>
        <InvoiceCard invoice={invoice} />
      </div>
    </div>
  )
}