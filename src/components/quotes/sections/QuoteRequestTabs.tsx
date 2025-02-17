
import type { QuoteRequest } from "@/types/quote-request"
import { Button } from "@/components/ui/button"
import { Archive } from "lucide-react"
import { QuoteRequestCard } from "@/components/quotes/QuoteRequestCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface QuoteRequestTabsProps {
  activeQuotes: QuoteRequest[]
  archivedQuotes: QuoteRequest[]
  services: any[]
  estimateAmount: Record<string, string>
  setEstimateAmount: (value: Record<string, string>) => void
  onEstimateSubmit: (id: string, estimates: Record<string, string>) => void
  onImageRemove: (url: string, quoteId: string, currentUrls: string[]) => void
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
  onImageRemove,
  onStatusChange,
  onDelete,
  onArchiveToggle
}: QuoteRequestTabsProps) {
  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList>
        <TabsTrigger value="active">Active Requests</TabsTrigger>
        <TabsTrigger value="archived">Archived Requests</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        <div className="grid gap-4">
          {activeQuotes.map((request) => (
            <div key={request.id} className="relative">
              <Button
                onClick={() => onArchiveToggle(request.id, request.is_archived)}
                className="absolute top-4 right-48 z-10"
                variant="ghost"
                size="icon"
                title="Archive quote request"
              >
                <Archive className="h-5 w-5" />
              </Button>
              <QuoteRequestCard
                request={request}
                services={services}
                estimateAmount={estimateAmount}
                setEstimateAmount={setEstimateAmount}
                onEstimateSubmit={onEstimateSubmit}
                onImageRemove={onImageRemove}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            </div>
          ))}
          {activeQuotes.length === 0 && (
            <p className="text-center text-muted-foreground">No active quote requests found.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="archived">
        <div className="grid gap-4">
          {archivedQuotes.map((request) => (
            <div key={request.id} className="relative">
              <Button
                onClick={() => onArchiveToggle(request.id, request.is_archived)}
                className="absolute top-4 right-48 z-10"
                variant="ghost"
                size="icon"
                title="Unarchive quote request"
              >
                <Archive className="h-5 w-5 text-muted-foreground" />
              </Button>
              <QuoteRequestCard
                request={request}
                services={services}
                estimateAmount={estimateAmount}
                setEstimateAmount={setEstimateAmount}
                onEstimateSubmit={onEstimateSubmit}
                onImageRemove={onImageRemove}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            </div>
          ))}
          {archivedQuotes.length === 0 && (
            <p className="text-center text-muted-foreground">No archived quote requests found.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
