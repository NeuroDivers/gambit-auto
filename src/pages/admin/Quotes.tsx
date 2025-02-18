import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Check, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { PageTitle } from "@/components/shared/PageTitle"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { QuoteRequest } from "@/types/quote-request"

export default function Quotes() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("quotes")
  const navigate = useNavigate()

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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder={`Search ${activeTab === 'quotes' ? 'quotes' : 'requests'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {activeTab === 'quotes' ? (
                <>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="estimated">Estimated</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="quotes" className="space-y-4">
          <div className="rounded-md border">
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
                {filteredQuotes && filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote) => (
                    <TableRow 
                      key={quote.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(quote.id, 'quote')}
                    >
                      <TableCell className="font-medium">
                        {quote.quote_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {quote.customer_first_name} {quote.customer_last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{quote.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            quote.status === 'accepted' ? 'default' : 
                            quote.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${quote.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(quote.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No quotes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
                {filteredRequests && filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow 
                      key={request.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(request.id, 'request')}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {request.client?.first_name} {request.client?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{request.client?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              request.status === 'accepted' ? 'default' : 
                              request.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {request.status}
                          </Badge>
                          {request.client_response && (
                            <Badge 
                              variant={request.client_response === "accepted" ? "success" : "destructive"}
                              className="flex items-center gap-1"
                            >
                              {request.client_response === "accepted" ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Accepted
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3" />
                                  Rejected
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {request.service_ids?.length || 0} services
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No quote requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
