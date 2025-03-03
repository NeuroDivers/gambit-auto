
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Customer } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"

export function CustomerList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState<string>("")
  
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      // Now using the customer_profiles view that joins customer and profile data
      const { data, error } = await supabase
        .from('client_statistics')
        .select('*')
        .order('last_invoice_date', { ascending: false })
        .is('last_invoice_date', null)
      
      if (error) throw error
      return data as Customer[]
    }
  })

  const filteredCustomers = customers?.filter(customer => {
    if (!search) return true
    
    const searchLower = search.toLowerCase()
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase()
    
    return (
      fullName.includes(searchLower) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.phone_number && customer.phone_number.includes(search))
    )
  })

  if (error) {
    console.error("Error loading customers:", error)
    return <div>Error loading customers. Please try again.</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Customer List</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">Loading customers...</div>
        ) : filteredCustomers?.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Customer</th>
                  <th className="text-left py-3 font-medium">Contact</th>
                  <th className="text-left py-3 font-medium">Total Spent</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers?.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/40">
                    <td className="py-3">
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.city && customer.state_province ? 
                          `${customer.city}, ${customer.state_province}` : 
                          "No location data"}
                      </div>
                    </td>
                    <td className="py-3">
                      <div>{customer.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.phone_number || "No phone"}
                      </div>
                    </td>
                    <td className="py-3">
                      <div>{formatCurrency(customer.total_spent || 0)}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.total_invoices || 0} invoice{customer.total_invoices !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-3">
                      {customer.last_invoice_date ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        View
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
