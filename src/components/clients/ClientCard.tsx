import { Button } from "@/components/ui/button"
import { FileText, Quote } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Client } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"

export function ClientCard({ 
  client,
  onEdit,
  actions
}: { 
  client: Client
  onEdit?: () => void
  actions?: React.ReactNode
}) {
  const navigate = useNavigate()

  const handleCreateQuote = () => {
    navigate('/admin/quotes/create', { 
      state: { preselectedClient: client }
    })
  }

  const handleCreateInvoice = () => {
    navigate('/admin/invoices/create', { 
      state: { preselectedClient: client }
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Avatar className="mr-2 h-8 w-8">
              <AvatarImage src={`https://avatar.vercel.sh/${client.email}.png`} />
              <AvatarFallback>{client.first_name[0]}{client.last_name[0]}</AvatarFallback>
            </Avatar>
            {client.first_name} {client.last_name}
          </CardTitle>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{client.email}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Phone:</span>
            <p className="text-muted-foreground">{client.phone || 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium">Total Spent:</span>
            <p className="text-muted-foreground">${client.total_spent.toFixed(2)}</p>
          </div>
          <div>
            <span className="font-medium">Work Orders:</span>
            <p className="text-muted-foreground">{client.total_work_orders}</p>
          </div>
          <div>
            <span className="font-medium">Invoices:</span>
            <p className="text-muted-foreground">{client.total_invoices}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Last Invoice: {client.last_invoice_date ? new Date(client.last_invoice_date).toLocaleDateString() : 'N/A'}
        </p>
      </CardFooter>
      {!actions && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCreateQuote}
          >
            <Quote className="h-4 w-4" />
            Create Quote
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCreateInvoice}
          >
            <FileText className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      )}
      {actions}
    </Card>
  )
}
