
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaffDetailsForm } from "./StaffDetailsForm";
import { StaffSkills } from "./StaffSkills";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";

type ProfileData = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  bio: string;
  street_address: string;
  unit_number: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  role: {
    id: string;
    name: string;
    nicename: string;
  };
};

export function StaffDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();
  const { isAdmin } = useAdminStatus();
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!id) return;

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
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setProfileData(data as unknown as ProfileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load staff profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Staff Not Found</h2>
        <Button onClick={() => navigate('/staff')}>Return to Staff List</Button>
      </div>
    );
  }

  const canEditProfile = isAdmin || user?.id === profileData.id;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {profileData.first_name} {profileData.last_name}
        </h1>
        <Button variant="outline" onClick={() => navigate('/staff')}>
          Back to Staff List
        </Button>
      </div>

      <div className="flex space-x-2 border-b mb-4">
        <Button 
          variant={activeSection === "profile" ? "default" : "ghost"}
          onClick={() => setActiveSection("profile")}
          className="rounded-none"
        >
          Profile
        </Button>
        <Button 
          variant={activeSection === "skills" ? "default" : "ghost"} 
          onClick={() => setActiveSection("skills")}
          className="rounded-none"
        >
          Service Skills
        </Button>
      </div>

      {activeSection === "profile" && (
        <Card>
          <CardContent className="pt-6">
            <StaffDetailsForm 
              profileId={profileData.id}
              onSaved={() => {
                // Reload the profile
                setIsLoading(true);
                window.location.reload();
              }}
              role={profileData.role}
              initialData={profileData}
            />
          </CardContent>
        </Card>
      )}

      {activeSection === "skills" && (
        <StaffSkills 
          profileId={profileData.id} 
          isCurrentUser={user?.id === profileData.id}
        />
      )}
    </div>
  );
}
