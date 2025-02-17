
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { QuoteList } from "@/components/quotes/QuoteList"
import { QuoteStats } from "@/components/quotes/QuoteStats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QuoteRequestsManagement from "./QuoteRequestsManagement"
import { Toaster } from "sonner"

export default function Quotes() {
  return (
    <>
      <Toaster />
      {/* Portal container for select menus and dialogs */}
      <div id="radix-portal-container" className="fixed top-0 left-0 z-[100]" />
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto py-12">
          <div className="px-6">
            <div className="mb-8">
              <PageBreadcrumbs />
              <h1 className="text-3xl font-bold">Quotes</h1>
            </div>
          </div>
          <div className="max-w-[1600px] mx-auto">
            <QuoteStats />
            
            <Tabs defaultValue="all-quotes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all-quotes">All Quotes</TabsTrigger>
                <TabsTrigger value="active-requests">Active Requests</TabsTrigger>
                <TabsTrigger value="archived-requests">Archived Requests</TabsTrigger>
              </TabsList>
              <TabsContent value="all-quotes">
                <QuoteList />
              </TabsContent>
              <TabsContent value="active-requests">
                <QuoteRequestsActiveList />
              </TabsContent>
              <TabsContent value="archived-requests">
                <QuoteRequestsArchivedList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}

// Split components for better organization
function QuoteRequestsActiveList() {
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
    handleEstimateSubmit,
  } = useQuoteRequestManagement()

  const activeQuotes = quoteRequests?.filter(q => !q.is_archived) || []

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!activeQuotes?.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No active quote requests found.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activeQuotes.map((request) => (
        <QuoteRequestCard
          key={request.id}
          request={request}
          services={services || []}
          onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
          onDelete={(id) => {
            setSelectedQuoteId(id)
            setDeleteDialogOpen(true)
          }}
          onArchiveToggle={(id, currentArchiveStatus) => {
            archiveQuoteMutation.mutate({ 
              id, 
              isArchived: !currentArchiveStatus 
            })
          }}
          estimateAmount={estimateAmount}
          setEstimateAmount={setEstimateAmount}
          onEstimateSubmit={handleEstimateSubmit}
        />
      ))}
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

function QuoteRequestsArchivedList() {
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
    handleEstimateSubmit,
  } = useQuoteRequestManagement()

  const archivedQuotes = quoteRequests?.filter(q => q.is_archived) || []

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!archivedQuotes?.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No archived quote requests found.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {archivedQuotes.map((request) => (
        <QuoteRequestCard
          key={request.id}
          request={request}
          services={services || []}
          onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
          onDelete={(id) => {
            setSelectedQuoteId(id)
            setDeleteDialogOpen(true)
          }}
          onArchiveToggle={(id, currentArchiveStatus) => {
            archiveQuoteMutation.mutate({ 
              id, 
              isArchived: !currentArchiveStatus 
            })
          }}
          estimateAmount={estimateAmount}
          setEstimateAmount={setEstimateAmount}
          onEstimateSubmit={handleEstimateSubmit}
        />
      ))}
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

