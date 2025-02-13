
import { useState } from "react"
import { Quote } from "./types"
import { CreateQuoteDialog } from "./CreateQuoteDialog"
import { EditQuoteDialog } from "./EditQuoteDialog"
import { QuoteListHeader } from "./list/QuoteListHeader"
import { QuoteCard } from "./list/QuoteCard"
import { DeleteQuoteDialog } from "./list/DeleteQuoteDialog"
import { useQuoteListData } from "./hooks/useQuoteListData"

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
    return <div>Loading quotes...</div>
  }

  return (
    <div className="relative space-y-4">
      <div id="quote-portal-root" className="absolute top-0 left-0" />
      
      <QuoteListHeader onCreateClick={() => setCreateDialogOpen(true)} />

      <div className="grid gap-4">
        {quotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConvertToWorkOrder={handleConvertToWorkOrder}
          />
        ))}
      </div>

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
