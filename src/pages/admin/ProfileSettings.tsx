
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoForm } from "@/components/profile/sections/PersonalInfoForm";
import { PasswordChangeForm } from "@/components/profile/sections/PasswordChangeForm";
import { DefaultCommissionForm } from "@/components/profile/sections/DefaultCommissionForm";
import { applyThemeClass } from "@/utils/themeUtils";
import { useForm } from "react-hook-form";

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<string>("personal-info");
  const personalInfoForm = useForm();
  const passwordForm = useForm();
  const commissionForm = useForm();

  useEffect(() => {
    // Apply dark theme by default
    applyThemeClass("dark");
  }, []);

  return (
    <div className="container py-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Profile Settings</h1>
      
      <Tabs defaultValue="personal-info" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal-info" className="space-y-6">
          <PersonalInfoForm 
            form={personalInfoForm} 
            onSubmit={() => console.log('Personal info submitted')} 
          />
        </TabsContent>
        
        <TabsContent value="password" className="space-y-6">
          <PasswordChangeForm 
            form={passwordForm} 
            onSubmit={() => console.log('Password changed')} 
            isUpdating={false}
            error={null}
          />
        </TabsContent>
        
        <TabsContent value="commission" className="space-y-6">
          <DefaultCommissionForm form={commissionForm} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
