
import React from 'react';
import { useProfileData } from './hooks/useProfileData';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalInfoForm } from '@/components/profile/sections/PersonalInfoForm';
import { PasswordChangeForm } from '@/components/profile/sections/PasswordChangeForm';
import { DefaultCommissionForm } from '@/components/profile/sections/DefaultCommissionForm';
import StaffSkills from './StaffSkills';

interface StaffDetailsProps {
  profileId?: string;
}

export function StaffDetails({ profileId }: StaffDetailsProps) {
  const { profile, isLoading } = useProfileData(profileId);

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <Card className="w-full">
      <Tabs defaultValue="personal-info" className="p-6">
        <TabsList className="mb-4">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal-info">
          <PersonalInfoForm profileId={profileId} />
        </TabsContent>
        
        <TabsContent value="security">
          <PasswordChangeForm />
        </TabsContent>
        
        <TabsContent value="skills">
          <StaffSkills />
        </TabsContent>
        
        <TabsContent value="commission">
          <DefaultCommissionForm profileId={profileId} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
