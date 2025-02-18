
import { Card, CardContent } from "@/components/ui/card"
import { useQuoteRequestDetails } from "@/hooks/useQuoteRequestDetails"
import { QuoteHeader } from "@/components/client/quotes/details/QuoteHeader"
import { RequestedServices } from "@/components/client/quotes/details/RequestedServices"
import { VehicleInformation } from "@/components/client/quotes/details/VehicleInformation"
import { MediaSection } from "@/components/client/quotes/details/MediaSection"
import { EstimateDetails } from "@/components/client/quotes/details/EstimateDetails"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function QuoteRequestDetails() {
  const navigate = useNavigate()
  const {
    quoteRequest,
    isLoading,
    uploading,
    handleFileUpload,
    handleImageRemove,
    getServiceName
  } = useQuoteRequestDetails()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!quoteRequest) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Quote request not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleBack = () => {
    navigate('/admin/quotes')
  }

  const handleAcceptEstimate = async () => {
    // Add implementation later
    toast.success("Estimate accepted")
  }

  const handleRejectEstimate = async () => {
    // Add implementation later
    toast.success("Estimate rejected")
  }

  return (
    <div className="p-6 space-y-6">
      <QuoteHeader quoteRequest={quoteRequest} onBack={handleBack} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <RequestedServices 
              quoteRequest={quoteRequest}
              getServiceName={getServiceName}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <VehicleInformation quoteRequest={quoteRequest} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <MediaSection
              quoteRequest={quoteRequest}
              onFileUpload={handleFileUpload}
              onImageRemove={handleImageRemove}
              uploading={uploading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <EstimateDetails
              quoteRequest={quoteRequest}
              getServiceName={getServiceName}
              onAcceptEstimate={handleAcceptEstimate}
              onRejectEstimate={handleRejectEstimate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
