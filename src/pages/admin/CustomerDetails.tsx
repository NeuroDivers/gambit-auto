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
import { Car } from "lucide-react"

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
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
          phone_number,
          first_name,
          last_name
        `)
        .eq('id', id)
        .single()
      
      if (customerError) throw customerError
      
      let profileData = null;
      if (customerData.profile_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone_number')
          .eq('id', customerData.profile_id)
          .single();
          
        if (!profileError && profile) {
          profileData = profile;
          
          if (!customerData.first_name) customerData.first_name = profile.first_name || '';
          if (!customerData.last_name) customerData.last_name = profile.last_name || '';
          if (!customerData.email) customerData.email = profile.email || '';
          if (!customerData.phone_number) customerData.phone_number = profile.phone_number;
        }
      }
      
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, status, created_at, vehicle_id')
        .eq('customer_id', id);
      
      const { data: quotes } = await supabase
        .from('estimates')
        .select('id, estimate_number, total, status, created_at, vehicle_id')
        .eq('customer_id', id);
      
      const formattedQuotes = quotes?.map(quote => ({
        id: quote.id,
        estimate_number: quote.estimate_number,
        total: quote.total,
        status: quote.status,
        created_at: quote.created_at,
        vehicle_id: quote.vehicle_id
      }));
            
      const total_spent = invoices?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0;
      const total_invoices = invoices?.length || 0;
      const total_work_orders = 0;

      const customerResult: Customer = {
        ...customerData,
        profile: profileData,
        invoices: invoices || [],
        quotes: formattedQuotes || [],
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
        
      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!id
  });

  if (isLoading) return <div>Loading...</div>
  if (!customer) return <div>Customer not found</div>

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
