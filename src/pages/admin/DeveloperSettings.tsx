
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeColorManager } from "@/components/developer/ThemeColorManager";
import { applyThemeClass } from "@/utils/themeUtils";

export default function DeveloperSettings() {
  const [activeTab, setActiveTab] = useState<string>("theme");

  useEffect(() => {
    // Apply dark theme by default
    applyThemeClass("dark");
  }, []);

  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Developer Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="theme">Theme Settings</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme" className="space-y-6">
          <ThemeColorManager />
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            <p className="text-muted-foreground">API configuration will be implemented in a future update.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">System Logs</h2>
            <p className="text-muted-foreground">System logs will be implemented in a future update.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
