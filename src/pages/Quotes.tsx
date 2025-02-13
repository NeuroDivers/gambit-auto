
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
      <div id="radix-portal-container" className="fixed top-0 left-0 z-50" />
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
            
            <Tabs defaultValue="quotes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
                <TabsTrigger value="requests">Quote Requests</TabsTrigger>
              </TabsList>
              <TabsContent value="quotes">
                <QuoteList />
              </TabsContent>
              <TabsContent value="requests">
                <QuoteRequestsManagement />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
