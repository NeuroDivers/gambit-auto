import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { PageTitle } from "@/components/shared/PageTitle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { QuoteRequest } from "@/types/quote-request"
import { QuoteFilters } from "./quotes/QuoteFilters"
import { QuotesTable } from "./quotes/QuotesTable"
import { QuoteRequestsTable } from "./quotes/QuoteRequestsTable"
import { QuoteMobileList } from "@/components/quotes/QuoteMobileList"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Quotes() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("quotes")
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const { data: quotes, isLoading: isLoadingQuotes, error: quotesError } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const { data: quoteRequests, isLoading: isLoadingRequests, error: requestsError } = useQuery({
    queryKey: ['quote-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          client:clients (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    }
  })

  const filteredQuotes = quotes?.filter(quote => {
    const matchesSearch = (
      quote.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesStatus = statusFilter === "all" || quote.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredRequests = quoteRequests?.filter(request => {
    const matchesSearch = (
      request.client?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleRowClick = (id: string, type: 'quote' | 'request') => {
    if (type === 'quote') {
      navigate(`/admin/quotes/${id}`)
    } else {
      navigate(`/admin/quotes/requests/${id}`)
    }
  }

  if (isLoadingQuotes || isLoadingRequests) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (quotesError || requestsError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading data. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <PageTitle 
          title="Quotes" 
          description="Manage quotes and quote requests"
        />
        <Link to="/admin/quotes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="requests">Quote Requests</TabsTrigger>
        </TabsList>

        <QuoteFilters
          activeTab={activeTab}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
        />

        <TabsContent value="quotes" className="space-y-4">
          <div className="rounded-md border">
            {isMobile ? (
              <QuoteMobileList 
                quotes={filteredQuotes || []}
                onRowClick={handleRowClick}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <QuotesTable 
                    quotes={filteredQuotes || []} 
                    onRowClick={handleRowClick}
                  />
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <QuoteRequestsTable 
                  requests={filteredRequests || []} 
                  onRowClick={handleRowClick}
                />
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
