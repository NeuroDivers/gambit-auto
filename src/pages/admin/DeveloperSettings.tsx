
import React from "react";
import { PageTitle } from "@/components/shared/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeColorManager } from "@/components/developer/ThemeColorManager";
import { CacheClearManager } from "@/components/developer/CacheClearManager";

export default function DeveloperSettings() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageTitle>Developer Settings</PageTitle>
      
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="theme">Theme Management</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme">
          <ThemeColorManager />
        </TabsContent>
        
        <TabsContent value="cache">
          <CacheClearManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
