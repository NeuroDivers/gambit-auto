
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaffDetailsForm } from './StaffDetailsForm';
import { StaffWorkOrderHistory } from './StaffWorkOrderHistory';
import StaffSkills from './StaffSkills';
import { StaffCommissionRates } from './StaffCommissionRates';
import { useProfileData } from './hooks/useProfileData';

export interface StaffDetailsProps {
  profileId: string;
}

export function StaffDetails({ profileId }: StaffDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    data: profileData, 
    isLoading, 
    error, 
    refetch,
    role
  } = useProfileData(profileId);

  if (isLoading) {
    return <div>Loading staff details...</div>;
  }

  if (error) {
    return <div>Error loading staff details</div>;
  }

  if (!profileData) {
    return <div>No staff found with this ID</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {profileData.first_name} {profileData.last_name}
            </CardTitle>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">{role?.nicename || role?.name || 'Staff Member'}</p>
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
              role={role}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{profileData.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{profileData.phone_number || 'N/A'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p>
                  {profileData.street_address ? (
                    <>
                      {profileData.unit_number && `${profileData.unit_number}, `}
                      {profileData.street_address}, 
                      {profileData.city && `${profileData.city}, `}
                      {profileData.state_province && `${profileData.state_province}, `}
                      {profileData.postal_code && `${profileData.postal_code}, `}
                      {profileData.country}
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              {profileData.bio && (
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Bio</p>
                  <p>{profileData.bio}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="workorders">Work History</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="skills" className="mt-4">
          <StaffSkills profileId={profileId} />
        </TabsContent>
        <TabsContent value="commission" className="mt-4">
          <StaffCommissionRates profileId={profileId} />
        </TabsContent>
        <TabsContent value="workorders" className="mt-4">
          <StaffWorkOrderHistory profileId={profileId} />
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Additional staff details would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
