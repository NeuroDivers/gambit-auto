
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffWorkOrderHistory } from "./StaffWorkOrderHistory";
import { StaffCommissionRates } from "./StaffCommissionRates";
import { StaffDetailsForm } from "./StaffDetailsForm";
import StaffSkills from "./StaffSkills";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { User } from '@/types';

interface StaffDetailsProps {
  profile: any;
  user: User;
  role: any;
  onClose: () => void;
  refetch: () => void;
}

export function StaffDetails({ profile, user, role, onClose, refetch }: StaffDetailsProps) {
  const [activeTab, setActiveTab] = React.useState("profile");
  
  const form = useForm({
    defaultValues: {
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      phone_number: profile?.phone_number,
      bio: profile?.bio,
      unit_number: profile?.unit_number,
      street_address: profile?.street_address,
      city: profile?.city,
      state_province: profile?.state_province,
      postal_code: profile?.postal_code,
      country: profile?.country,
    },
  });

  const getInitials = (first: string, last: string) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
          <AvatarFallback>
            {getInitials(profile?.first_name, profile?.last_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold">
            {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="ghost" className="ml-auto" onClick={onClose}>
          Close
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-4">
          <StaffDetailsForm 
            profileData={profile}
            onSaved={refetch}
            profileId={profile?.id}
            role={role}
          />
        </TabsContent>
        
        <TabsContent value="skills" className="mt-4">
          <StaffSkills profileId={profile?.id} />
        </TabsContent>
        
        <TabsContent value="commission" className="mt-4">
          <StaffCommissionRates profileId={profile?.id} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <StaffWorkOrderHistory profileId={profile?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
