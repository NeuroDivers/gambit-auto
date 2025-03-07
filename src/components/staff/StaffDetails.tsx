
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PersonalInfoForm } from '@/components/profile/sections/PersonalInfoForm';
import { PasswordChangeForm } from '@/components/profile/sections/PasswordChangeForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffSkills from './StaffSkills';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { profileFormSchema } from '@/components/profile/schemas/profileFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { StaffCommissionRates } from './StaffCommissionRates';

export interface StaffDetailsProps {
  profileId: string;
}

export function StaffDetails({ profileId }: StaffDetailsProps) {
  const [activeTab, setActiveTab] = useState('skills');
  
  const { data, isLoading } = useQuery({
    queryKey: ['staff-details', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });
  
  const personalInfoForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: data?.first_name || '',
      last_name: data?.last_name || '',
      phone_number: data?.phone_number || '',
      bio: data?.bio || '',
      // Add other fields here as needed
    }
  });

  if (isLoading) {
    return <Skeleton className="w-full h-96" />;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="commission">Commission</TabsTrigger>
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
      </TabsList>
      
      <TabsContent value="skills">
        {profileId && <StaffSkills profileId={profileId} />}
      </TabsContent>
      
      <TabsContent value="commission">
        {profileId && <StaffCommissionRates profileId={profileId} />}
      </TabsContent>
      
      <TabsContent value="personal">
        <div className="space-y-8">
          {/* Form components would be implemented here */}
          {profileId && data && (
            <PersonalInfoForm 
              form={personalInfoForm}
              onSubmit={async (values) => {
                console.log('Submitting values:', values);
              }}
              isUpdating={false}
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
