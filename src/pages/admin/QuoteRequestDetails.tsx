
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
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"

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

  const handleConvertToWorkOrder = async () => {
    try {
      if (!quoteRequest.estimated_amount) {
        toast.error("Please provide an estimate first")
        return
      }

      // Create work order with quote request data
      const { data: workOrder, error: workOrderError } = await supabase
        .from('work_orders')
        .insert({
          first_name: quoteRequest.client?.first_name,
          last_name: quoteRequest.client?.last_name,
          email: quoteRequest.client?.email,
          phone_number: quoteRequest.client?.phone_number,
          contact_preference: 'email',
          vehicle_make: quoteRequest.vehicle_make,
          vehicle_model: quoteRequest.vehicle_model,
          vehicle_year: quoteRequest.vehicle_year,
          vehicle_serial: quoteRequest.vehicle_vin,
          additional_notes: quoteRequest.description,
          client_id: quoteRequest.client_id,
          status: 'pending'
        })
        .select()
        .single()

      if (workOrderError) throw workOrderError

      // Add services to work order
      const workOrderServices = quoteRequest.service_ids.map(serviceId => ({
        work_order_id: workOrder.id,
        service_id: serviceId,
        quantity: 1,
        unit_price: (quoteRequest.service_estimates?.[serviceId] || 0)
      }))

      const { error: servicesError } = await supabase
        .from('work_order_services')
        .insert(workOrderServices)

      if (servicesError) throw servicesError

      // Archive the quote request
      const { error: archiveError } = await supabase
        .from('quote_requests')
        .update({ 
          is_archived: true,
          status: 'converted'
        })
        .eq('id', quoteRequest.id)

      if (archiveError) throw archiveError

      toast.success("Successfully converted to work order")
      navigate(`/admin/work-orders/${workOrder.id}/edit`)
    } catch (error) {
      console.error('Error converting to work order:', error)
      toast.error("Failed to convert to work order")
    }
  }

  const handleConvertToInvoice = async () => {
    try {
      if (!quoteRequest.estimated_amount) {
        toast.error("Please provide an estimate first")
        return
      }

      // Calculate tax amounts based on the current tax rates
      const { data: taxes } = await supabase
        .from('business_taxes')
        .select('*')
      
      const gstRate = taxes?.find(t => t.tax_type === 'GST')?.tax_rate || 0
      const qstRate = taxes?.find(t => t.tax_type === 'QST')?.tax_rate || 0
      
      const subtotal = quoteRequest.estimated_amount
      const gstAmount = (subtotal * gstRate) / 100
      const qstAmount = (subtotal * qstRate) / 100
      const total = subtotal + gstAmount + qstAmount

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          customer_first_name: quoteRequest.client?.first_name,
          customer_last_name: quoteRequest.client?.last_name,
          customer_email: quoteRequest.client?.email,
          customer_phone: quoteRequest.client?.phone_number,
          vehicle_make: quoteRequest.vehicle_make,
          vehicle_model: quoteRequest.vehicle_model,
          vehicle_year: quoteRequest.vehicle_year,
          vehicle_vin: quoteRequest.vehicle_vin,
          notes: quoteRequest.description,
          subtotal,
          gst_amount: gstAmount,
          qst_amount: qstAmount,
          total,
          status: 'draft',
          client_id: quoteRequest.client_id
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Add services to invoice
      const invoiceItems = quoteRequest.service_ids.map(serviceId => ({
        invoice_id: invoice.id,
        service_id: serviceId,
        service_name: getServiceName(serviceId),
        quantity: 1,
        unit_price: (quoteRequest.service_estimates?.[serviceId] || 0)
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) throw itemsError

      // Archive the quote request
      const { error: archiveError } = await supabase
        .from('quote_requests')
        .update({ 
          is_archived: true,
          status: 'converted'
        })
        .eq('id', quoteRequest.id)

      if (archiveError) throw archiveError

      toast.success("Successfully converted to invoice")
      navigate(`/admin/invoices/${invoice.id}/edit`)
    } catch (error) {
      console.error('Error converting to invoice:', error)
      toast.error("Failed to convert to invoice")
    }
  }

  const isArchived = quoteRequest.is_archived || quoteRequest.status === 'converted'

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <QuoteHeader quoteRequest={quoteRequest} onBack={handleBack} />
        {!isArchived && quoteRequest.estimated_amount && (
          <div className="flex gap-4">
            <Button onClick={handleConvertToWorkOrder}>
              Convert to Work Order
            </Button>
            <Button onClick={handleConvertToInvoice}>
              Convert to Invoice
            </Button>
          </div>
        )}
      </div>
      
      {isArchived && (
        <Card className="border-warning">
          <CardContent className="pt-6">
            <p className="text-warning-foreground">
              This quote request has been converted to a work order or invoice and is now archived.
            </p>
          </CardContent>
        </Card>
      )}
      
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
