
import { usePermissions } from "@/hooks/usePermissions"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { AdminDashboard } from "./templates/AdminDashboard"
import { StaffDashboard } from "./templates/StaffDashboard"
import { ClientDashboard } from "./templates/ClientDashboard"
import { useEffect } from "react"

export default function Dashboard() {
  const { currentUserRole, isLoading: roleLoading } = usePermissions()
  
  useEffect(() => {
    console.log("Dashboard component mounting, current role:", currentUserRole);
    
    // Debug session data - check if we have a session at all
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session ? "Found" : "Not found", session);
      
      if (!session) {
        console.warn("No session found on dashboard load!");
      }
    };
    
    checkSession();
  }, [currentUserRole]);

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error("No user found in auth.getUser")
          return null
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          throw error
        }
        
        console.log("Profile data fetched:", data)
        return data
      } catch (e) {
        console.error("Error in profile query:", e)
        throw e
      }
    },
    enabled: true, // Always fetch profile even if role isn't loaded yet
    retry: 3,
    retryDelay: 1000
  })

  console.log("Dashboard rendering. Role:", currentUserRole, "Profile:", profile)

  // DEBUGGING: Change loading behavior to show content faster
  const showLoadingScreen = false; // Set to false to bypass loading screen
  
  if (showLoadingScreen && (roleLoading || profileLoading)) {
    console.log("Still loading role or profile, showing loading screen");
    return <LoadingScreen />
  }

  if (profileError) {
    console.error("Profile error:", profileError);
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Error Loading Profile</h2>
        <p className="text-red-500">There was an error loading your profile. Please try refreshing the page.</p>
        <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(profileError, null, 2)}
        </pre>
      </div>
    );
  }

  if (!profile) {
    console.error("No profile found");
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
        <p>Your user profile could not be loaded. This may happen if your account was recently created.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Debug fallback - default to admin dashboard if we can't determine role
  if (!currentUserRole) {
    console.warn("No user role found, showing default admin dashboard as fallback for debugging");
    return <AdminDashboard profile={profile} />
  }

  // Determine which dashboard to show based on role's default_dashboard
  if (currentUserRole?.default_dashboard === 'admin') {
    return <AdminDashboard profile={profile} />
  }

  if (currentUserRole?.default_dashboard === 'staff') {
    return <StaffDashboard profile={profile} />
  }

  // Default to client dashboard
  return <ClientDashboard profile={profile} />
}
