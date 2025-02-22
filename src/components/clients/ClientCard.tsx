
import { Client } from "./types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Pencil, Trash, FileText, Quote } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface ClientCardProps {
  client: Client
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const navigate = useNavigate()

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{client.first_name} {client.last_name}</span>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(client)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(client)}
              className="text-destructive hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{client.email}</p>
        {client.phone_number && (
          <p className="text-sm text-muted-foreground">{client.phone_number}</p>
        )}
        {client.address && (
          <p className="text-sm text-muted-foreground">{client.address}</p>
        )}
      </CardContent>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => navigate('/admin/quotes/create', { state: { preselectedClient: client } })}
          >
            <Quote className="h-4 w-4" />
            Create Quote
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => navigate('/admin/invoices/create', { state: { preselectedClient: client } })}
          >
            <FileText className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 mt-auto">
        <div className="flex justify-between w-full text-sm">
          <span>Total Invoices:</span>
          <span>{client.total_invoices}</span>
        </div>
        <div className="flex justify-between w-full text-sm">
          <span>Total Work Orders:</span>
          <span>{client.total_work_orders}</span>
        </div>
        <div className="flex justify-between w-full text-sm">
          <span>Total Spent:</span>
          <span>${client.total_spent?.toFixed(2) || '0.00'}</span>
        </div>
        {client.last_invoice_date && (
          <div className="flex justify-between w-full text-sm">
            <span>Last Invoice:</span>
            <span>{format(new Date(client.last_invoice_date), 'PP')}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
