
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { QuoteRequest } from "@/types/quote-request"

interface QuoteHeaderProps {
  quoteRequest: QuoteRequest
  onCreateWorkOrder: () => void
  onCreateInvoice: () => void
  isCreatingWorkOrder: boolean
  isCreatingInvoice: boolean
}

export function QuoteHeader({
  quoteRequest,
  onCreateWorkOrder,
  onCreateInvoice,
  isCreatingWorkOrder,
  isCreatingInvoice
}: QuoteHeaderProps) {
  const showConversionButtons = quoteRequest.status === 'accepted' || 
    (quoteRequest.client_response === 'accepted' && quoteRequest.status === 'estimated')

  return (
    <div className="mb-8">
      <PageBreadcrumbs />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Quote Request Details</h1>
          <Badge variant={quoteRequest.status === 'pending' ? 'secondary' : 
                      quoteRequest.status === 'estimated' ? 'default' :
                      quoteRequest.status === 'accepted' ? 'outline' :
                      quoteRequest.status === 'rejected' ? 'destructive' : 'outline'}>
            {quoteRequest.status}
          </Badge>
        </div>
        {showConversionButtons && (
          <div className="flex gap-2">
            <Button 
              onClick={onCreateWorkOrder}
              disabled={isCreatingWorkOrder}
            >
              {isCreatingWorkOrder ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Convert to Work Order
            </Button>
            <Button 
              variant="outline"
              onClick={onCreateInvoice}
              disabled={isCreatingInvoice}
            >
              {isCreatingInvoice ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Draft Invoice
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
