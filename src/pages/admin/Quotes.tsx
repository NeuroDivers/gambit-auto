
import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { PageTitle } from "@/components/shared/PageTitle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuoteFilters } from "./quotes/QuoteFilters"
import { EstimatesList } from "./quotes/EstimatesList"
import { EstimateRequestsList } from "./quotes/EstimateRequestsList"
import { useEstimatesData } from "./quotes/useEstimatesData"

export default function Quotes() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("quotes")
  const navigate = useNavigate()

  const { quotes, quoteRequests, isLoading, error } = useEstimatesData(searchTerm, statusFilter)

  const handleRowClick = (id: string, type: 'quote' | 'request') => {
    if (type === 'quote') {
      navigate(`/estimates/${id}`)
    } else {
      navigate(`/estimates/requests/${id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading data. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <PageTitle 
          title="Estimates" 
          description="Manage estimates and estimate requests"
        />
        <Link to="/estimates/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="quotes">Estimates</TabsTrigger>
          <TabsTrigger value="requests">Estimate Requests</TabsTrigger>
        </TabsList>

        <QuoteFilters
          activeTab={activeTab}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
        />

        <TabsContent value="quotes" className="space-y-4">
          <EstimatesList 
            quotes={quotes || []} 
            onRowClick={handleRowClick}
          />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <EstimateRequestsList 
            requests={quoteRequests || []} 
            onRowClick={handleRowClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
