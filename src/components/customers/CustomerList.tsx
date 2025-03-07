
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
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis
} from "@/components/ui/pagination"
import { toast } from "sonner"

export function CustomerList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const PAGE_SIZE = 10
  
  // Fetch total count for pagination
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const { count, error } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
        
        if (error) {
          console.error('Error fetching customer count:', error)
          return
        }
        
        if (count !== null) {
          setTotalCustomers(count)
          setTotalPages(Math.ceil(count / PAGE_SIZE))
        }
      } catch (err) {
        console.error('Error in fetchTotalCount:', err)
        toast.error("Failed to load customer count")
      }
    }
    
    fetchTotalCount()
  }, [])
  
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', page, PAGE_SIZE],
    queryFn: async () => {
      console.log(`Fetching customers for page ${page}`)
      // Calculate offset
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      
      try {
        // Fetch customers with pagination
        const { data: customersData, error } = await supabase
          .from('customers')
          .select(`
            id, 
            customer_first_name, 
            customer_last_name, 
            customer_email, 
            customer_phone,
            customer_city, 
            customer_state_province,
            profile_id,
            created_at
          `)
          .order('created_at', { ascending: false })
          .range(from, to)
        
        if (error) {
          console.error("Error fetching customers:", error)
          throw error
        }
        
        if (!customersData || customersData.length === 0) {
          return []
        }
        
        // For customers with profile_id, fetch profile data
        const customersWithProfiles = await Promise.all(customersData.map(async (customer) => {
          const customerWithProfile: Partial<Customer> = { ...customer };
          
          if (customer.profile_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email, phone_number')
              .eq('id', customer.profile_id)
              .maybeSingle()
            
            if (profileData) {
              // Create a profile property
              customerWithProfile.profile = profileData
              
              // Use profile data if customer fields are empty
              if (!customer.customer_first_name) customerWithProfile.customer_first_name = profileData.first_name || ''
              if (!customer.customer_last_name) customerWithProfile.customer_last_name = profileData.last_name || ''
              if (!customer.customer_email) customerWithProfile.customer_email = profileData.email || ''
              if (!customer.customer_phone) customerWithProfile.customer_phone = profileData.phone_number
            }
          }
          
          // Fetch customer statistics
          let totalSpent = 0
          let totalInvoices = 0
          let lastInvoiceDate = null
          
          const { data: invoices } = await supabase
            .from('invoices')
            .select('id, total, created_at, vehicle_id')
            .eq('customer_id', customer.id)
          
          if (invoices && invoices.length > 0) {
            totalInvoices = invoices.length
            totalSpent = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
            lastInvoiceDate = invoices.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0].created_at
          }
          
          return {
            ...customerWithProfile,
            total_spent: totalSpent,
            total_invoices: totalInvoices,
            last_invoice_date: lastInvoiceDate
          } as Customer
        }))
        
        return customersWithProfiles
      } catch (error) {
        console.error('Error fetching customers:', error)
        throw error
      }
    },
    retry: 1
  })

  const filteredCustomers = customers?.filter(customer => {
    if (!search) return true
    
    const searchLower = search.toLowerCase()
    const fullName = `${customer.customer_first_name} ${customer.customer_last_name}`.toLowerCase()
    
    return (
      fullName.includes(searchLower) ||
      (customer.customer_email && customer.customer_email.toLowerCase().includes(searchLower)) ||
      (customer.customer_phone && customer.customer_phone.includes(search))
    )
  }) || []

  // Handle page changes
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo(0, 0)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include first page, last page, and pages around current page
      if (page <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('ellipsis')
        pageNumbers.push(totalPages)
      } else if (page >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1)
        pageNumbers.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        // Middle
        pageNumbers.push(1)
        pageNumbers.push('ellipsis')
        pageNumbers.push(page - 1)
        pageNumbers.push(page)
        pageNumbers.push(page + 1)
        pageNumbers.push('ellipsis')
        pageNumbers.push(totalPages)
      }
    }
    
    return pageNumbers
  }

  if (error) {
    console.error("Error loading customers:", error)
    return <div className="p-4 text-red-500">Error loading customers. Please try again.</div>
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
        ) : filteredCustomers.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No customers found.</p>
          </div>
        ) : (
          <>
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
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/40">
                      <td className="py-3">
                        <div className="font-medium">
                          {customer.customer_first_name} {customer.customer_last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.customer_city && customer.customer_state_province ? 
                            `${customer.customer_city}, ${customer.customer_state_province}` : 
                            "No location data"}
                        </div>
                      </td>
                      <td className="py-3">
                        <div>{customer.customer_email}</div>
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
            
            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {filteredCustomers.length} of {totalCustomers} customers
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => goToPage(page - 1)}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((pageNum, i) => (
                    pageNum === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => goToPage(pageNum as number)}
                          isActive={pageNum === page}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => goToPage(page + 1)}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
