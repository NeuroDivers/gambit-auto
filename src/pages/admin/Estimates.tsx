
import { useEffect, useState } from "react";
import EstimatesList from "./quotes/EstimatesList";
import { EstimateRequestsList } from "./quotes/EstimateRequestsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTitle } from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, FileText, Send, CheckCircle } from "lucide-react";
import { useEstimateRequestsData } from "@/hooks/useEstimateRequestsData";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Get estimate statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['estimateStats'],
    queryFn: async () => {
      console.log("Fetching estimate statistics...");
      const { data, error } = await supabase
        .from("estimates")
        .select("status, is_archived")
        
      if (error) {
        console.error("Error fetching estimate statistics:", error);
        throw error;
      }
      
      const draft = data.filter(e => e.status === "draft" && !e.is_archived).length;
      const sent = data.filter(e => e.status === "sent" && !e.is_archived).length;
      const approved = data.filter(e => e.status === "approved" && !e.is_archived).length;
      const archived = data.filter(e => e.is_archived).length;
      
      return { 
        draft, 
        sent, 
        approved, 
        archived, 
        total: data.length 
      };
    }
  });

  // Show loading state
  const loadingValue = <div className="animate-pulse bg-muted h-8 w-20 rounded" />;
  
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageTitle 
            title="Estimates" 
            description="Manage your customer estimates and estimate requests" 
          />
          <div className="flex flex-wrap items-center gap-4">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="estimates">Estimates</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              onClick={() => navigate("/admin/create-estimate")}
              className="w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Estimate
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? loadingValue : stats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All created estimates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? loadingValue : stats?.draft || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Draft estimates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? loadingValue : stats?.sent || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Sent to clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? loadingValue : stats?.approved || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Client-approved estimates
              </p>
            </CardContent>
          </Card>
        </div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="estimates" className="mt-0 p-0">
          <EstimatesList />
        </TabsContent>
        
        <TabsContent value="requests" className="mt-0 p-0">
          <EstimateRequestsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
