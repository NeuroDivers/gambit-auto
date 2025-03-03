
import { useEffect, useState } from "react"
import { EstimatesList } from "./quotes/EstimatesList"
import { EstimateRequestsList } from "./quotes/EstimateRequestsList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTitle } from "@/components/shared/PageTitle"

export default function Estimates() {
  const [activeTab, setActiveTab] = useState("estimates")

  // Update the document title when the component mounts
  useEffect(() => {
    document.title = "Estimates | Auto Detailing CRM"
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageTitle 
        title="Estimates" 
        description="Manage your customer estimates and estimate requests"
      />

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
