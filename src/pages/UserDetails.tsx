
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StaffSkills from '@/components/staff/StaffSkills';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function UserDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentUserRole } = usePermissions();
  const [activeTab, setActiveTab] = useState('personal-info');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <p>You need to be logged in to view this page.</p>
      </div>
    );
  }

  const showSkillsTab = currentUserRole?.default_dashboard === 'staff' || 
                       currentUserRole?.default_dashboard === 'admin';
  
  const showCommissionTab = currentUserRole?.default_dashboard === 'staff' || 
                           currentUserRole?.default_dashboard === 'admin';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <Card className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="mb-8">
            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
            <TabsTrigger value="security">Password</TabsTrigger>
            {showSkillsTab && <TabsTrigger value="skills">Skills</TabsTrigger>}
            {showCommissionTab && <TabsTrigger value="commission">Commission</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="personal-info">
            <CardHeader className="px-0">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ProfileForm role={currentUserRole?.name} />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="security">
            <CardHeader className="px-0">
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password or update security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ProfileForm />
            </CardContent>
          </TabsContent>
          
          {showSkillsTab && (
            <TabsContent value="skills">
              <CardHeader className="px-0">
                <CardTitle>Service Skills</CardTitle>
                <CardDescription>
                  Manage the services you are skilled at providing
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                {profile.id && <StaffSkills profileId={profile.id} />}
              </CardContent>
            </TabsContent>
          )}
          
          {showCommissionTab && (
            <TabsContent value="commission">
              <CardHeader className="px-0">
                <CardTitle>Default Commission</CardTitle>
                <CardDescription>
                  Set your default commission settings for services
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <ProfileForm />
              </CardContent>
            </TabsContent>
          )}
        </Tabs>
      </Card>
    </div>
  );
}
