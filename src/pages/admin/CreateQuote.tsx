
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft, Search } from "lucide-react"
import { Client } from "@/components/clients/types"
import { useEffect, useRef, useState } from "react"
import { CustomerInfoSection } from "@/components/quotes/form-sections/CustomerInfoSection"
import { VehicleInfoSection } from "@/components/quotes/form-sections/VehicleInfoSection"
import { ServicesSection } from "@/components/quotes/form-sections/ServicesSection"
import { NotesSection } from "@/components/quotes/form-sections/NotesSection"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import debounce from "lodash/debounce"

type FormData = {
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_unit_number: string
  customer_street_address: string
  customer_city: string
  customer_state_province: string
  customer_postal_code: string
  customer_country: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  service_items: Array<{
    service_id: string
    service_name: string
    quantity: number
    unit_price: number
  }>
  notes: string
}

interface LocationState {
  preselectedClient?: Client;
}

export default function CreateQuote() {
  const navigate = useNavigate()
  const location = useLocation()
  const { preselectedClient } = location.state as LocationState || {}
  const initialized = useRef(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const form = useForm<FormData>({
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      customer_unit_number: "",
      customer_street_address: "",
      customer_city: "",
      customer_state_province: "",
      customer_postal_code: "",
      customer_country: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: "",
      service_items: [],
      notes: ""
    }
  })

  // Client search functionality
  const { data: searchResults } = useQuery({
    queryKey: ['client-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return []
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
        .limit(5)

      if (error) throw error
      return data
    },
    enabled: searchTerm.length > 2
  })

  const handleSearchTermChange = debounce((value: string) => {
    setSearchTerm(value)
  }, 300)

  const handleClientSelect = (client: Client) => {
    form.setValue('customer_first_name', client.first_name)
    form.setValue('customer_last_name', client.last_name)
    form.setValue('customer_email', client.email)
    form.setValue('customer_phone', client.phone_number || '')
    form.setValue('customer_unit_number', client.unit_number || '')
    form.setValue('customer_street_address', client.street_address || '')
    form.setValue('customer_city', client.city || '')
    form.setValue('customer_state_province', client.state_province || '')
    form.setValue('customer_postal_code', client.postal_code || '')
    form.setValue('customer_country', client.country || '')
    setSearchDialogOpen(false)

    // Fetch client's vehicles
    fetchClientVehicles(client.id)
  }

  const fetchClientVehicles = async (clientId: string) => {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_primary', true)
      .maybeSingle()

    if (error) {
      console.error('Error fetching vehicle:', error)
      return
    }

    if (vehicles) {
      form.setValue('vehicle_make', vehicles.make)
      form.setValue('vehicle_model', vehicles.model)
      form.setValue('vehicle_year', vehicles.year)
      form.setValue('vehicle_vin', vehicles.vin || '')
    }
  }

  // Set client information only once on initial mount
  useEffect(() => {
    if (!initialized.current && preselectedClient) {
      handleClientSelect(preselectedClient)
      initialized.current = true
    }
  }, [preselectedClient])

  const onSubmit = async (data: FormData) => {
    try {
      // Calculate totals
      const subtotal = data.service_items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      )

      // Create quote
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          customer_first_name: data.customer_first_name,
          customer_last_name: data.customer_last_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_unit_number: data.customer_unit_number,
          customer_street_address: data.customer_street_address,
          customer_city: data.customer_city,
          customer_state_province: data.customer_state_province,
          customer_postal_code: data.customer_postal_code,
          customer_country: data.customer_country,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_vin: data.vehicle_vin,
          notes: data.notes,
          subtotal,
          total: subtotal,
          status: 'draft',
          client_id: preselectedClient?.id
        })
        .select()
        .single()

      if (error) throw error

      // Add quote items
      if (quote) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            data.service_items.map(item => ({
              quote_id: quote.id,
              service_id: item.service_id,
              service_name: item.service_name,
              quantity: item.quantity,
              unit_price: item.unit_price
            }))
          )

        if (itemsError) throw itemsError
      }

      toast.success("Estimate created successfully")
      navigate(`/admin/estimates/${quote?.id}`)
    } catch (error: any) {
      console.error('Error creating estimate:', error)
      toast.error("Failed to create estimate")
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-6 p-2">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/estimates')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle 
          title="Create Estimate"
          description="Create a new estimate for a customer"
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearchDialogOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Search Customers
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <CustomerInfoSection form={form} />
            <VehicleInfoSection form={form} />
            <ServicesSection form={form} />
            <NotesSection form={form} />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Create Estimate
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Customers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Search by name, email, or phone..."
              onChange={(e) => handleSearchTermChange(e.target.value)}
            />
            {searchResults && searchResults.length > 0 ? (
              <Table>
                <TableBody>
                  {searchResults.map((client) => (
                    <TableRow 
                      key={client.id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleClientSelect(client)}
                    >
                      <TableCell>
                        {client.first_name} {client.last_name}
                        <div className="text-sm text-muted-foreground">
                          {client.email}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : searchTerm.length > 2 ? (
              <p className="text-center text-muted-foreground">No customers found</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
