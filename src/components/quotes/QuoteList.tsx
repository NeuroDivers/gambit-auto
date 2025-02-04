import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Quote } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CreateQuoteDialog } from "./CreateQuoteDialog"

export function QuoteList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
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
              <CardTitle className="flex justify-between">
                <span>{quote.quote_number}</span>
                <span className="text-sm font-normal">
                  Status: {quote.status}
                </span>
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
    </div>
  )
}