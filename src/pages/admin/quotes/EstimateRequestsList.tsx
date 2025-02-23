
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QuoteRequestsTable } from "./QuoteRequestsTable"
import { QuoteRequestMobileList } from "@/components/quotes/QuoteRequestMobileList"
import { useIsMobile } from "@/hooks/use-mobile"
import type { QuoteRequest } from "@/types/quote-request"

interface EstimateRequestsListProps {
  requests: QuoteRequest[]
  onRowClick: (id: string, type: 'request') => void
}

export function EstimateRequestsList({ requests, onRowClick }: EstimateRequestsListProps) {
  const isMobile = useIsMobile()

  return (
    <div className="rounded-md border">
      {isMobile ? (
        <QuoteRequestMobileList 
          requests={requests}
          onRowClick={onRowClick}
        />
      ) : (
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
              requests={requests} 
              onRowClick={onRowClick}
            />
          </TableBody>
        </Table>
      )}
    </div>
  )
}
