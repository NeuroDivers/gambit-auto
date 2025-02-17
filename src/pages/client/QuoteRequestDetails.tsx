
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuoteRequestActions } from "@/hooks/useQuoteRequestActions"
import { QuoteHeader } from "@/components/client/quotes/details/QuoteHeader"
import { VehicleInformation } from "@/components/client/quotes/details/VehicleInformation"
import { RequestedServices } from "@/components/client/quotes/details/RequestedServices"
import { MediaSection } from "@/components/client/quotes/details/MediaSection"
import { EstimateDetails } from "@/components/client/quotes/details/EstimateDetails"
import { Button } from "@/components/ui/button"
import { useQuoteRequestDetails } from "@/hooks/useQuoteRequestDetails"

export default function QuoteRequestDetails() {
  const navigate = useNavigate()
  const { handleResponseMutation } = useQuoteRequestActions()
  const {
    quoteRequest,
    isLoading,
    uploading,
    isSaving,
    handleFileUpload,
    handleImageRemove,
    handleSave,
    getServiceName
  } = useQuoteRequestDetails()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!quoteRequest) {
    return <div>Quote request not found</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <QuoteHeader 
          quoteRequest={quoteRequest}
          onBack={() => navigate("/client/quotes")}
        />
        <Button 
          onClick={async () => {
            const success = await handleSave()
            if (success) {
              navigate("/client/quotes")
            }
          }} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <VehicleInformation quoteRequest={quoteRequest} />
          
          <RequestedServices 
            quoteRequest={quoteRequest}
            getServiceName={getServiceName}
          />

          {quoteRequest.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
              <p className="text-muted-foreground">{quoteRequest.description}</p>
            </div>
          )}

          <MediaSection
            quoteRequest={quoteRequest}
            onFileUpload={handleFileUpload}
            onImageRemove={handleImageRemove}
            uploading={uploading}
          />

          <EstimateDetails
            quoteRequest={quoteRequest}
            getServiceName={getServiceName}
            onAcceptEstimate={() => handleResponseMutation.mutate({ 
              id: quoteRequest.id, 
              response: "accepted" 
            })}
            onRejectEstimate={() => handleResponseMutation.mutate({ 
              id: quoteRequest.id, 
              response: "rejected" 
            })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
