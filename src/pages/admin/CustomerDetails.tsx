
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Customer, Vehicle } from "@/components/customers/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleList } from "@/components/customers/vehicles/VehicleList"
import { CustomerHeader } from "@/components/customers/details/CustomerHeader"
import { CustomerStats } from "@/components/customers/details/CustomerStats"
import { SpendingChart } from "@/components/customers/details/SpendingChart"
import { CustomerHistory } from "@/components/customers/details/CustomerHistory"
import { CustomerInvoices } from "@/components/customers/details/CustomerInvoices"
import { CustomerQuotes } from "@/components/customers/details/CustomerQuotes"
import { Button } from "@/components/ui/button"
import { Car, Loader2 } from "lucide-react"

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      // Fetch the customer data with all the proper column names
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select(`
          id,
          profile_id,
          customer_street_address,
          customer_unit_number,
          customer_city,
          customer_state_province,
          customer_postal_code,
          customer_country,
          customer_address,
          created_at,
          updated_at,
          user_id,
          access_token,
          customer_email,
          customer_phone,
          customer_first_name,
          customer_last_name,
          notes
        `)
        .eq('id', id)
        .single()
      
      if (customerError) {
        console.error("Error fetching customer:", customerError)
        throw customerError
      }
      
      // Debug output
      console.log("Fetched customer data:", customerData)
      
      let profileData = null;
      if (customerData.profile_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone_number')
          .eq('id', customerData.profile_id)
          .single();
          
        if (!profileError && profile) {
          profileData = profile;
        }
      }
      
      // Fetch invoices for this customer
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, status, created_at, vehicle_id')
        .eq('customer_id', id);
      
      if (invoicesError) {
        console.error("Error fetching invoices:", invoicesError)
      }
      
      // Fetch quotes (estimates) for this customer
      const { data: quotes, error: quotesError } = await supabase
        .from('estimates')
        .select('id, estimate_number, total, status, created_at, vehicle_id')
        .eq('customer_id', id);
      
      if (quotesError) {
        console.error("Error fetching quotes:", quotesError)
      }
      
      const formattedQuotes = quotes?.map(quote => ({
        id: quote.id,
        estimate_number: quote.estimate_number,
        total: quote.total,
        status: quote.status,
        created_at: quote.created_at,
        vehicle_id: quote.vehicle_id
      })) || [];
            
      const total_spent = invoices?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
      const total_invoices = invoices?.length || 0;
      const total_work_orders = 0;

      // Create the final customer object
      const customerResult: Customer = {
        ...customerData,
        profile: profileData,
        invoices: invoices || [],
        quotes: formattedQuotes,
        total_spent,
        total_invoices,
        total_work_orders
      };
      
      return customerResult;
    }
  })

  const { data: vehicles } = useQuery({
    queryKey: ['customer_vehicles', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', id);
        
      if (error) {
        console.error("Error fetching vehicles:", error)
        throw error;
      }
      return data as Vehicle[];
    },
    enabled: !!id
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
  
  if (error) {
    console.error("Error in CustomerDetails:", error)
    return <div className="p-6">Error loading customer: {error.message}</div>
  }

  if (!customer) return <div className="p-6">Customer not found</div>

  return (
    <div className="p-6 space-y-6">
      <CustomerHeader customer={customer} />
      <CustomerStats customer={customer} />
      <SpendingChart customer={customer} />

      <div className="flex justify-end">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => navigate(`/customers/${customer.id}/vehicles`)}
        >
          <Car className="h-4 w-4" />
          View All Vehicles
        </Button>
      </div>

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotes">Estimates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="border rounded-lg mt-6">
          <VehicleList customerId={customer.id} vehicles={vehicles} />
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
