
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Customer } from "@/components/customers/types"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleList } from "@/components/customers/vehicles/VehicleList"
import { CustomerHeader } from "@/components/customers/details/CustomerHeader"
import { CustomerStats } from "@/components/customers/details/CustomerStats"
import { SpendingChart } from "@/components/customers/details/SpendingChart"
import { CustomerHistory } from "@/components/customers/details/CustomerHistory"
import { CustomerInvoices } from "@/components/customers/details/CustomerInvoices"
import { CustomerQuotes } from "@/components/customers/details/CustomerQuotes"

export default function CustomerDetails() {
  const { id } = useParams()

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      // Get customer data and join with profile data if available
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select(`
          id,
          profile_id,
          street_address,
          unit_number,
          city,
          state_province,
          postal_code,
          country,
          created_at,
          updated_at,
          user_id,
          access_token,
          email,
          first_name,
          last_name,
          invoices (
            id,
            invoice_number,
            total,
            status,
            created_at
          ),
          quotes:quotes_client_id_fkey (
            id,
            quote_number,
            total,
            status,
            created_at
          )
        `)
        .eq('id', id)
        .single()
      
      if (customerError) throw customerError
      
      // If there's a profile_id, get the profile data to get the most up-to-date info
      let profileData = null;
      if (customerData.profile_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, phone_number')
          .eq('id', customerData.profile_id)
          .single();
          
        if (!profileError && profile) {
          // Merge profile data over customer data (profile takes precedence)
          profileData = {
            first_name: profile.first_name || customerData.first_name,
            last_name: profile.last_name || customerData.last_name,
            email: profile.email || customerData.email,
            phone_number: profile.phone_number
          };
        }
      }
            
      // Calculate summary statistics
      const total_spent = 0 // This will be calculated in the CustomerStats component
      const total_invoices = customerData?.invoices?.length || 0
      const total_work_orders = 0

      return {
        ...customerData,
        ...(profileData || {}), // Overlay profile data if available
        total_spent,
        total_invoices,
        total_work_orders
      } as Customer
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (!customer) return <div>Customer not found</div>

  return (
    <div className="p-6 space-y-6">
      <CustomerHeader customer={customer} />
      <CustomerStats customer={customer} />
      <SpendingChart customer={customer} />

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotes">Estimates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="border rounded-lg mt-6">
          <VehicleList customerId={customer.id} />
        </TabsContent>

        <TabsContent value="history" className="border rounded-lg mt-6">
          <CustomerHistory customer={customer} />
        </TabsContent>

        <TabsContent value="invoices" className="border rounded-lg mt-6">
          <CustomerInvoices customer={customer} />
        </TabsContent>

        <TabsContent value="quotes" className="border rounded-lg mt-6">
          <CustomerQuotes customer={customer} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
