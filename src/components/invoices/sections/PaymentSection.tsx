
import { Button } from "@/components/ui/button"
import { usePayment } from "../hooks/usePayment"
import { Loader2 } from "lucide-react"
import { Invoice } from "../types"

type PaymentSectionProps = {
  invoice: Invoice
}

export function PaymentSection({ invoice }: PaymentSectionProps) {
  const { mutate: processPayment, isPending } = usePayment()

  const handlePayment = () => {
    processPayment({
      invoiceId: invoice.id,
      amount: invoice.total,
      email: invoice.customer_email || '',
    })
  }

  if (invoice.payment_status === 'succeeded') {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-green-700">Payment completed successfully</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">Total Amount: ${invoice.total.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            Status: {invoice.payment_status || 'unpaid'}
          </p>
        </div>
        <Button 
          onClick={handlePayment} 
          disabled={isPending || invoice.payment_status === 'succeeded'}
          className="min-w-[120px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </Button>
      </div>
    </div>
  )
}
