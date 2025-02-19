
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-muted">
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-medium">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={`https://avatar.vercel.sh/${client.email}.png`} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {client.first_name[0]}{client.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex flex-col">
              <span className="text-base">{client.first_name} {client.last_name}</span>
              <span className="text-sm text-muted-foreground font-normal">{client.email}</span>
            </div>
          </CardTitle>
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onEdit}
              className="hover:bg-primary/10 hover:text-primary"
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium">{client.phone_number || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Address</span>
            <p className="font-medium">{client.address || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-3 border-t bg-muted/5">
        <div className="flex justify-between items-center w-full">
          <p className="text-xs text-muted-foreground">
            Created: {new Date(client.created_at).toLocaleDateString()}
          </p>
        </div>
        {!actions && (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              onClick={handleCreateQuote}
            >
              <Quote className="h-4 w-4" />
              Create Quote
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              onClick={handleCreateInvoice}
            >
              <FileText className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        )}
        {actions}
      </CardFooter>
    </Card>
  )
}
