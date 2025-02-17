
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { QuoteForm } from "@/components/quotes/QuoteForm"
import { useLocation, useNavigate } from "react-router-dom"
import { Client } from "@/components/clients/types"

export default function CreateQuote() {
  const location = useLocation()
  const navigate = useNavigate()
  const preselectedClient = location.state?.preselectedClient as Client | undefined

  const handleSuccess = () => {
    navigate('/quotes')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="mb-8">
            <PageBreadcrumbs />
            <h1 className="text-3xl font-bold">Create Quote</h1>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <QuoteForm 
            onSuccess={handleSuccess}
            defaultValues={preselectedClient ? {
              customer_first_name: preselectedClient.first_name,
              customer_last_name: preselectedClient.last_name,
              customer_email: preselectedClient.email,
              customer_phone: preselectedClient.phone_number || '',
              customer_address: preselectedClient.address || '',
              vehicle_make: '',
              vehicle_model: '',
              vehicle_year: new Date().getFullYear(),
              vehicle_vin: '',
              notes: '',
              service_items: []
            } : undefined}
          />
        </div>
      </div>
    </div>
  )
}
