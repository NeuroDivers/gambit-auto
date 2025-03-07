
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffSkills } from "./StaffSkills";
import { StaffWorkOrderHistory } from "./StaffWorkOrderHistory";
import { StaffCommissionRates } from "./StaffCommissionRates";
import { StaffDetailsForm } from "./StaffDetailsForm";
import { StaffProfile } from "@/components/staff/types/staff";

interface StaffDetailsProps {
  staff: StaffProfile;
  profileId: string;
  isAdmin: boolean;
  onClose?: () => void;
  refetch?: () => void;
}

export function StaffDetails({ staff, profileId, isAdmin, onClose, refetch }: StaffDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");
  
  // Define the form with explicit types matching what PersonalInfoForm expects
  const form = useForm({
    defaultValues: {
      first_name: staff?.first_name || "",
      last_name: staff?.last_name || "",
      phone_number: staff?.phone_number || "",
      bio: staff?.bio || "",
      unit_number: staff?.unit_number || "",
      street_address: staff?.street_address || "",
      city: staff?.city || "",
      state_province: staff?.state_province || "",
      postal_code: staff?.postal_code || "",
      country: staff?.country || ""
    }
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="commissions">Commission Rates</TabsTrigger>
          <TabsTrigger value="history">Work History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Details</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffDetailsForm 
                form={form} 
                onClose={onClose} 
                profileId={profileId}
                role={staff?.role?.name}
                refetch={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffSkills profileId={profileId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffCommissionRates profileId={profileId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Work Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffWorkOrderHistory profileId={profileId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {isAdmin && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      )}
    </div>
  );
}
