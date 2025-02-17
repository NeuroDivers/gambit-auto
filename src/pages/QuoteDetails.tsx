
import { useParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { QuoteHeader } from "./quotes/components/QuoteHeader"
import { CustomerInfo } from "./quotes/components/CustomerInfo"
import { VehicleInfo } from "./quotes/components/VehicleInfo"
import { MediaGallery } from "./quotes/components/MediaGallery"
import { useQuoteDetails } from "./quotes/hooks/useQuoteDetails"

export default function QuoteDetails() {
  const { id } = useParams()
  const {
    quoteRequest,
    isLoading,
    handleImageRemove,
    createWorkOrder,
    createInvoice,
    isCreatingWorkOrder,
    isCreatingInvoice
  } = useQuoteDetails(id)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!quoteRequest) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Quote request not found.</p>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <div className="px-6">
        <QuoteHeader
          quoteRequest={quoteRequest}
          onCreateWorkOrder={createWorkOrder}
          onCreateInvoice={createInvoice}
          isCreatingWorkOrder={isCreatingWorkOrder}
          isCreatingInvoice={isCreatingInvoice}
        />
        <Card className="p-6">
          <div className="space-y-6">
            <CustomerInfo quoteRequest={quoteRequest} />
            <VehicleInfo quoteRequest={quoteRequest} />
            <div>
              <h2 className="text-xl font-semibold mb-4">Attached Images</h2>
              <MediaGallery 
                mediaUrls={quoteRequest.media_urls}
                status={quoteRequest.status}
                onRemoveImage={handleImageRemove}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
