
import { Loader2 } from "lucide-react"
import { useQuoteRequests } from "@/hooks/useQuoteRequests"
import { useQuoteRequestManagement } from "@/components/quotes/hooks/useQuoteRequestManagement"
import { QuoteRequestTabs } from "@/components/quotes/sections/QuoteRequestTabs"
import { DeleteQuoteDialog } from "@/components/quotes/DeleteQuoteDialog"

export default function QuoteRequestsManagement() {
  const {
    services,
    quoteRequests,
    isLoading,
    archiveQuoteMutation,
    updateStatusMutation,
    deleteQuoteMutation
  } = useQuoteRequests()

  const {
    estimateAmount,
    setEstimateAmount,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedQuoteId,
    setSelectedQuoteId,
    handleImageRemove,
    handleEstimateSubmit
  } = useQuoteRequestManagement()

  const handleArchiveToggle = (id: string, currentArchiveStatus: boolean) => {
    archiveQuoteMutation.mutate({ 
      id, 
      isArchived: !currentArchiveStatus 
    })
  }

  const handleStatusChange = (id: string, status: QuoteRequest['status']) => {
    updateStatusMutation.mutate({ id, status })
  }

  const handleDelete = (id: string) => {
    setSelectedQuoteId(id)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const activeQuotes = quoteRequests?.filter(q => !q.is_archived) || []
  const archivedQuotes = quoteRequests?.filter(q => q.is_archived) || []

  return (
    <div className="container mx-auto py-6">
      <QuoteRequestTabs
        activeQuotes={activeQuotes}
        archivedQuotes={archivedQuotes}
        services={services || []}
        estimateAmount={estimateAmount}
        setEstimateAmount={setEstimateAmount}
        onEstimateSubmit={handleEstimateSubmit}
        onImageRemove={handleImageRemove}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onArchiveToggle={handleArchiveToggle}
      />

      <DeleteQuoteDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (selectedQuoteId) {
            deleteQuoteMutation.mutate(selectedQuoteId)
            setDeleteDialogOpen(false)
          }
        }}
      />
    </div>
  )
}
