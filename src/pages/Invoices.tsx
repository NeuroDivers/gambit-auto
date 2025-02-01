import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { Button } from "@/components/ui/button"
import { FilePlus } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Invoices() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <PageBreadcrumbs />
              <h1 className="text-3xl font-bold">Invoices</h1>
            </div>
            <Button 
              onClick={() => navigate("/work-orders")} 
              className="gap-2"
            >
              <FilePlus className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <InvoiceList />
        </div>
      </div>
    </div>
  )
}