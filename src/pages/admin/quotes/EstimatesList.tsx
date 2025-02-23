
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QuotesTable } from "./QuotesTable"
import { QuoteMobileList } from "@/components/quotes/QuoteMobileList"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Quote } from "@/components/quotes/types"

interface EstimatesListProps {
  quotes: Quote[]
  onRowClick: (id: string, type: 'quote') => void
}

export function EstimatesList({ quotes, onRowClick }: EstimatesListProps) {
  const isMobile = useIsMobile()

  return (
    <div className="rounded-md border">
      {isMobile ? (
        <QuoteMobileList 
          quotes={quotes}
          onRowClick={onRowClick}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estimate #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <QuotesTable 
              quotes={quotes} 
              onRowClick={onRowClick}
            />
          </TableBody>
        </Table>
      )}
    </div>
  )
}
