import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Quote } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Plus } from "lucide-react"
import { useState } from "react"
import { CreateQuoteDialog } from "./CreateQuoteDialog"
import { EditQuoteDialog } from "./EditQuoteDialog"
import { QuoteStatusSelect } from "./QuoteStatusSelect"

export function QuoteList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          quote_items (*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Quote[]
    }
  })

  const handleEdit = (quote: Quote) => {
    setSelectedQuote(quote)
    setEditDialogOpen(true)
  }

  if (isLoading) {
    return <div>Loading quotes...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quotes</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Quote
        </Button>
      </div>

      <div className="grid gap-4">
        {quotes.map((quote) => (
          <Card key={quote.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{quote.quote_number}</span>
                <div className="flex items-center gap-4">
                  <QuoteStatusSelect 
                    status={quote.status} 
                    quoteId={quote.id}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(quote)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Customer: </span>
                  {quote.customer_first_name} {quote.customer_last_name}
                </div>
                <div>
                  <span className="font-semibold">Vehicle: </span>
                  {quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}
                </div>
                <div>
                  <span className="font-semibold">Total: </span>
                  ${quote.total.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateQuoteDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedQuote && (
        <EditQuoteDialog
          quote={selectedQuote}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  )
}