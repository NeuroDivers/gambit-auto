
import { useState } from "react"
import { Quote } from "./types"
import { CreateQuoteDialog } from "./CreateQuoteDialog"
import { EditQuoteDialog } from "./EditQuoteDialog"
import { QuoteCard } from "./list/QuoteCard"
import { DeleteQuoteDialog } from "./list/DeleteQuoteDialog"
import { useQuoteListData } from "./hooks/useQuoteListData"
import { Card } from "../ui/card"
import { Loader2 } from "lucide-react"

export function QuoteList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const { 
    quotes, 
    isLoading, 
    deleteQuoteMutation, 
    convertToWorkOrderMutation 
  } = useQuoteListData()

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
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!quotes?.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No quotes found.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <QuoteCard
          key={quote.id}
          quote={quote}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onConvertToWorkOrder={handleConvertToWorkOrder}
        />
      ))}

      {createDialogOpen && (
        <CreateQuoteDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      )}

      {selectedQuote && editDialogOpen && (
        <EditQuoteDialog
          quote={selectedQuote}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {deleteDialogOpen && (
        <DeleteQuoteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={() => {
            if (selectedQuote) {
              deleteQuoteMutation.mutate(selectedQuote.id)
              setDeleteDialogOpen(false)
              setSelectedQuote(null)
            }
          }}
        />
      )}
    </div>
  )
}
