
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Plus, Database, Loader2 } from "lucide-react"
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
import { format } from "date-fns"
import { PageTitle } from "@/components/shared/PageTitle"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Invoice } from "@/components/invoices/types"
import { InvoiceMobileList } from "@/components/invoices/InvoiceMobileList"
import { useIsMobile } from "@/hooks/use-mobile"
import { getInvoiceStatusVariant } from "@/components/shared/BadgeVariants"
import { useGenerateDummyInvoices } from "@/hooks/useGenerateDummyInvoices"

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { generateDummyInvoices } = useGenerateDummyInvoices()

  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Invoice[]
    }
  })

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = (
      invoice.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleRowClick = (id: string) => {
    navigate(`/invoices/${id}`)
  }

  const handleGenerateDummyData = async () => {
    setIsGenerating(true);
    try {
      await generateDummyInvoices(10);
      refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading invoices. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageTitle 
          title="Invoices" 
          description="Manage customer invoices"
        />
        <div className="flex gap-2">
          <Button onClick={handleGenerateDummyData} variant="outline" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Generate Test Data
              </>
            )}
          </Button>
          <Button onClick={() => navigate("/invoices/create")}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search invoices..."
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          {isMobile ? (
            <InvoiceMobileList 
              invoices={filteredInvoices || []}
              onRowClick={handleRowClick}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices && filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow 
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(invoice.id)}
                    >
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {invoice.customer_first_name} {invoice.customer_last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${invoice.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No invoices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
