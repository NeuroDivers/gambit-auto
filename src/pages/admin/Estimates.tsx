
import { useEffect, useState } from "react"
import { EstimatesList } from "./quotes/EstimatesList"
import { EstimateRequestsList } from "./quotes/EstimateRequestsList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTitle } from "@/components/shared/PageTitle"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useEstimateRequestsData } from "@/hooks/useEstimateRequestsData"
import { useNavigate } from "react-router-dom"

export default function Estimates() {
  const [activeTab, setActiveTab] = useState("estimates")
  const { createTestEstimateRequest, loading } = useEstimateRequestsData()
  const navigate = useNavigate()

  // Update the document title when the component mounts
  useEffect(() => {
    document.title = "Estimates | Auto Detailing CRM"
  }, [])

  const handleCreateTestData = async () => {
    const data = await createTestEstimateRequest()
    if (data && data.length > 0) {
      setActiveTab("requests")
      // Force a refresh of the component
      navigate(0)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle 
          title="Estimates" 
          description="Manage your customer estimates and estimate requests"
        />
        
        <Button 
          onClick={handleCreateTestData}
          disabled={loading}
          size="sm"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Test Request
        </Button>
      </div>

      <Tabs
        defaultValue="estimates"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="requests">Estimate Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="estimates" className="mt-6">
          <EstimatesList />
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <EstimateRequestsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
