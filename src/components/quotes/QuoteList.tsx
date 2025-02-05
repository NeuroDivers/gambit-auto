import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Quote } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Plus, Trash2, FileText, ClipboardList } from "lucide-react"
import { useState } from "react"
import { CreateQuoteDialog } from "./CreateQuoteDialog"
import { EditQuoteDialog } from "./EditQuoteDialog"
import { QuoteStatusSelect } from "./QuoteStatusSelect"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function QuoteList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  
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

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quoteId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast.success("Quote deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedQuote(null)
    },
    onError: (error) => {
      toast.error("Failed to delete quote: " + error.message)
    }
  })

  const convertToWorkOrderMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const { data, error } = await supabase.rpc('convert_quote_to_work_order', {
        quote_id: quoteId
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast.success("Quote converted to work order successfully")
    },
    onError: (error) => {
      toast.error("Failed to convert quote: " + error.message)
    }
  })

  const handleEdit = (quote: Quote) => {
    setSelectedQuote(quote)
    setEditDialogOpen(true)
  }

  const handleDelete = (quote: Quote) => {
    setSelectedQuote(quote)
    setDeleteDialogOpen(true)
  }

  const handleConvertToWorkOrder = async (quoteId: string) => {
    try {
      await convertToWorkOrderMutation.mutateAsync(quoteId)
    } catch (error) {
      console.error("Error converting quote to work order:", error)
    }
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
                    variant="outline"
                    size="icon"
                    onClick={() => handleConvertToWorkOrder(quote.id)}
                    disabled={quote.status === 'converted'}
                    title="Convert to Work Order"
                  >
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(quote)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(quote)}
                  >
                    <Trash2 className="h-4 w-4" />
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quote
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedQuote && deleteQuoteMutation.mutate(selectedQuote.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}