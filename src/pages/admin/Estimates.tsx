
import { useEffect, useState } from "react";
import EstimatesList from "./quotes/EstimatesList";
import { EstimateRequestsList } from "./quotes/EstimateRequestsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTitle } from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { useEstimateRequestsData } from "@/hooks/useEstimateRequestsData";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function Estimates() {
  const [activeTab, setActiveTab] = useState("estimates");
  const {
    createTestEstimateRequest,
    loading,
    debugInfo
  } = useEstimateRequestsData();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Update the document title when the component mounts
  useEffect(() => {
    document.title = "Estimates | Auto Detailing CRM";
  }, []);
  
  const handleCreateTestData = async () => {
    try {
      setError(null);
      const data = await createTestEstimateRequest();
      if (data) {
        setActiveTab("requests");
        // Force a refresh of the component
        navigate(0);
      }
    } catch (err) {
      console.error("Error creating test data:", err);
      setError(err.message || "Failed to create test data");
    }
  };
  
  return <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle 
          title="Estimates" 
          description="Manage your customer estimates and estimate requests" 
        />
        
        
      </div>

      {error && <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error creating test data</p>
              <p className="text-sm text-red-600">{error}</p>
              {debugInfo && <pre className="text-xs mt-2 overflow-auto max-h-32 bg-white p-2 rounded">{JSON.stringify(debugInfo, null, 2)}</pre>}
            </div>
          </CardContent>
        </Card>}

      <Tabs defaultValue="estimates" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
    </div>;
}
