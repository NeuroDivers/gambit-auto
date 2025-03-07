
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import StaffSkills from './StaffSkills';
import { StaffDetailsForm } from './StaffDetailsForm';
import { StaffWorkOrderHistory } from './StaffWorkOrderHistory';
import { StaffCommissionRates } from './StaffCommissionRates';

// Define the ProfileData interface
interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  bio: string | null;
  street_address: string | null;
  unit_number: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  role: {
    id: string;
    name: string;
    nicename: string;
  } | null;
}

export interface StaffDetailsProps {
  profileId: string;
}

export function StaffDetails({ profileId }: StaffDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const { data: profileData, isLoading, refetch } = useQuery<ProfileData, Error>({
    queryKey: ['staff-details', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone_number,
          bio,
          street_address, 
          unit_number,
          city,
          state_province,
          postal_code,
          country,
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .eq('id', profileId)
        .single();
      
      if (error) throw error;
      return data as ProfileData;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profileData) {
    return <div>Staff profile not found</div>;
  }

  const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Staff Member';

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{fullName}</CardTitle>
          <CardDescription>{profileData.email}</CardDescription>
          {profileData.role && (
            <span className="text-sm text-muted-foreground">{profileData.role.nicename}</span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="ml-auto">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <StaffDetailsForm
            profileId={profileId}
            profileData={profileData}
            onSaved={() => {
              setIsEditing(false);
              refetch();
            }}
            onClose={() => setIsEditing(false)}
            role={profileData.role?.name}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="history">Work History</TabsTrigger>
              <TabsTrigger value="commission">Commission</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {profileData.email}</p>
                    <p><span className="font-medium">Phone:</span> {profileData.phone_number || 'Not provided'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Address</h3>
                  <div className="space-y-2">
                    {profileData.street_address && (
                      <p>
                        {profileData.street_address}
                        {profileData.unit_number && `, Unit ${profileData.unit_number}`}
                      </p>
                    )}
                    {(profileData.city || profileData.state_province) && (
                      <p>
                        {profileData.city}{profileData.city && profileData.state_province && ', '}{profileData.state_province} {profileData.postal_code}
                      </p>
                    )}
                    <p>{profileData.country}</p>
                  </div>
                </div>
              </div>
              
              {profileData.bio && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Bio</h3>
                  <p className="text-sm">{profileData.bio}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="skills">
              <StaffSkills profileId={profileId} />
            </TabsContent>
            
            <TabsContent value="history">
              <StaffWorkOrderHistory profileId={profileId} />
            </TabsContent>
            
            <TabsContent value="commission">
              <StaffCommissionRates profileId={profileId} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
