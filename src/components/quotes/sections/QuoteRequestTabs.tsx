
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuoteRequestCard } from "../QuoteRequestCard"
import type { QuoteRequest } from "@/types/quote-request"

interface QuoteRequestTabsProps {
  activeQuotes: QuoteRequest[]
  archivedQuotes: QuoteRequest[]
  services: any[]
  estimateAmount: Record<string, string>
  setEstimateAmount: (value: Record<string, string>) => void
  onEstimateSubmit: (id: string, estimates: Record<string, string>) => void
  onStatusChange: (id: string, status: QuoteRequest['status']) => void
  onDelete: (id: string) => void
  onArchiveToggle: (id: string, currentArchiveStatus: boolean) => void
}

export function QuoteRequestTabs({
  activeQuotes,
  archivedQuotes,
  services,
  estimateAmount,
  setEstimateAmount,
  onEstimateSubmit,
  onStatusChange,
  onDelete,
  onArchiveToggle,
}: QuoteRequestTabsProps) {
  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="space-y-4">
        {activeQuotes.map((request) => (
          <QuoteRequestCard
            key={request.id}
            request={request}
            services={services}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onArchiveToggle={onArchiveToggle}
            estimateAmount={estimateAmount}
            setEstimateAmount={setEstimateAmount}
            onEstimateSubmit={onEstimateSubmit}
          />
        ))}
        {activeQuotes.length === 0 && (
          <p className="text-center text-muted-foreground">No active quote requests.</p>
        )}
      </TabsContent>

      <TabsContent value="archived" className="space-y-4">
        {archivedQuotes.map((request) => (
          <QuoteRequestCard
            key={request.id}
            request={request}
            services={services}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onArchiveToggle={onArchiveToggle}
            estimateAmount={estimateAmount}
            setEstimateAmount={setEstimateAmount}
            onEstimateSubmit={onEstimateSubmit}
          />
        ))}
        {archivedQuotes.length === 0 && (
          <p className="text-center text-muted-foreground">No archived quote requests.</p>
        )}
      </TabsContent>
    </Tabs>
  )
}
