
import React, { useEffect, useState } from "react";
import { PageTitle } from "@/components/shared/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeColorManager } from "@/components/developer/ThemeColorManager";
import { CacheClearManager } from "@/components/developer/CacheClearManager";

export default function DeveloperSettings() {
  const [activeTab, setActiveTab] = useState<string>("theme");

  // Load the active tab from localStorage if available
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem("__developer_settings_tabs__");
      if (savedTab) {
        setActiveTab(savedTab);
      }
    } catch (error) {
      console.error("Error loading saved tab:", error);
    }
  }, []);

  // Save the active tab to localStorage
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    try {
      localStorage.setItem("__developer_settings_tabs__", value);
    } catch (error) {
      console.error("Error saving tab:", error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageTitle title="Developer Settings">Developer Settings</PageTitle>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="theme">Theme Management</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme" className="mt-6">
          <ThemeColorManager />
        </TabsContent>
        
        <TabsContent value="cache" className="mt-6">
          <CacheClearManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
