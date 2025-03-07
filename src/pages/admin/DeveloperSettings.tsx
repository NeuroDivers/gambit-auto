
import React from "react";
import { PageTitle } from "@/components/shared/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeColorManager } from "@/components/developer/ThemeColorManager";
import { CacheClearManager } from "@/components/developer/CacheClearManager";

export default function DeveloperSettings() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageTitle title="Developer Settings">Developer Settings</PageTitle>
      
      <Tabs defaultValue="theme" className="w-full">
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
