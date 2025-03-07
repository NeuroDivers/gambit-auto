
import React, { useState } from 'react';
import { useQuoteRequests } from '@/hooks/useQuoteRequests';
import { QuoteRequestCard } from '@/components/client/quotes/QuoteRequestCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { QuoteRequestFormDialog } from '@/components/client/quotes/QuoteRequestFormDialog';
import { QuoteRequestForm } from '@/components/client/quotes/QuoteRequestForm';
import { QuoteRequestList } from '@/components/client/quotes/QuoteRequestList';
import { QuoteRequestSheet } from '@/components/client/quotes/QuoteRequestSheet';
import { ClientQuoteStats } from '@/components/client/quotes/ClientQuoteStats';

export default function QuoteRequests() {
  const { quoteRequests, isLoading, refetch } = useQuoteRequests();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedQuoteRequestId, setSelectedQuoteRequestId] = useState<string | null>(null);

  const handleCreateQuoteRequest = () => {
    setDialogOpen(true);
  };

  const handleQuoteRequestSuccess = () => {
    refetch();
    setDialogOpen(false);
    setSheetOpen(false);
  };

  const handleQuoteRequestClick = (quoteRequestId: string) => {
    setSelectedQuoteRequestId(quoteRequestId);
    setSheetOpen(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const pendingRequests = quoteRequests.filter(request => request.status === 'pending');
  const completedRequests = quoteRequests.filter(request => request.status !== 'pending');

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quote Requests</h1>
          <p className="text-muted-foreground">
            Request quotes for services and track their status
          </p>
        </div>
        <Button onClick={handleCreateQuoteRequest}>
          <Plus className="mr-2 h-4 w-4" />
          New Quote Request
        </Button>
      </div>

      <ClientQuoteStats 
        totalRequests={quoteRequests.length}
        pendingRequests={pendingRequests.length}
        approvedRequests={quoteRequests.filter(r => r.status === 'approved').length}
        rejectedRequests={quoteRequests.filter(r => r.status === 'rejected').length}
      />

      {quoteRequests.length === 0 ? (
        <EmptyState
          title="No Quote Requests"
          description="You haven't requested any quotes yet."
          action={
            <Button onClick={handleCreateQuoteRequest}>
              <Plus className="mr-2 h-4 w-4" />
              New Quote Request
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
              <QuoteRequestList
                quoteRequests={pendingRequests}
                onQuoteRequestClick={handleQuoteRequestClick}
              />
            </div>
          )}

          {completedRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed Requests</h2>
              <QuoteRequestList
                quoteRequests={completedRequests}
                onQuoteRequestClick={handleQuoteRequestClick}
              />
            </div>
          )}
        </div>
      )}

      <QuoteRequestFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleQuoteRequestSuccess}
      />

      <QuoteRequestSheet 
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        quoteRequestId={selectedQuoteRequestId}
        onSuccess={handleQuoteRequestSuccess}
      />
    </div>
  );
}
