
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { format } from "date-fns"
import type { QuoteRequest } from "@/types/quote-request"

interface QuoteRequestsTableProps {
  requests: QuoteRequest[]
  onRowClick: (id: string, type: 'request') => void
}

export function QuoteRequestsTable({ requests, onRowClick }: QuoteRequestsTableProps) {
  if (!requests.length) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center">
          No quote requests found
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {requests.map((request) => (
        <TableRow 
          key={request.id}
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onRowClick(request.id, 'request')}
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
      )}
    </>
  )
}
