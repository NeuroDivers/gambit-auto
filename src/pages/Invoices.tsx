import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { InvoiceList } from "@/components/invoices/InvoiceList"

export default function Invoices() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <PageBreadcrumbs />
          <h1 className="text-3xl font-bold mb-8">Invoices</h1>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <InvoiceList />
        </div>
      </div>
    </div>
  )
}