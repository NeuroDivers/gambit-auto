import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { InvoiceCard } from '../InvoiceCard'
import { Printer } from 'lucide-react'

type InvoicePrintPreviewProps = {
  invoice: any // Using any temporarily, should be properly typed
}

export function InvoicePrintPreview({ invoice }: InvoicePrintPreviewProps) {
  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    documentTitle: `Invoice-${invoice?.invoice_number}`,
    onAfterPrint: () => console.log('Printed successfully'),
    pageStyle: '@page { size: auto; margin: 20mm; }',
  })

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
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