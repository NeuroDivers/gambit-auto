
import { useInvoiceList } from "./hooks/useInvoiceList"
import { InvoiceListItem } from "./sections/InvoiceListItem"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Invoice } from "./types"

export function InvoiceList() {
  const { data: invoices = [], isLoading } = useInvoiceList()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = searchQuery === "" || 
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      `${invoice.customer_first_name} ${invoice.customer_last_name}`.toLowerCase().includes(searchLower) ||
      invoice.customer_email?.toLowerCase().includes(searchLower)
    
    return matchesStatus && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <InvoiceListItem key={invoice.id} invoice={invoice} />
        ))}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No invoices found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
