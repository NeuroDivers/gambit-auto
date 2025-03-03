
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole, User } from "./useUserData";

export type StaffUser = User & {
  position?: string | null;
  department?: string | null;
  employee_id?: string | null;
  status?: string | null;
};

export const useStaffUserData = () => {
  return useQuery({
    queryKey: ["staff_users"],
    queryFn: async () => {
      console.log("Fetching staff users...");
      
      // Get the client role ID to filter it out
      const { data: clientRole, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "client")
        .single();
      
      if (roleError) {
        console.error("Error fetching client role:", roleError);
        // Continue without filtering if we can't get the client role
      }
      
      const clientRoleId = clientRole?.id;
      console.log("Client role ID:", clientRoleId);
      
      // Fetch staff data from staff_view, excluding client roles
      let query = supabase
        .from("staff_view")
        .select(`
          profile_id,
          first_name,
          last_name,
          email,
          role_id,
          role_name,
          role_nicename,
          position,
          department,
          employee_id,
          status
        `);
        
      // Only apply the filter if we found the client role ID
      if (clientRoleId) {
        query = query.neq("role_id", clientRoleId);
      }

      const { data: staffData, error: staffError } = await query;

      if (staffError) {
        console.error("Error fetching staff data:", staffError);
        throw staffError;
      }

      console.log("Fetched staff data:", staffData);

      // Transform staff_view data to match User format
      const staffUsers: StaffUser[] = staffData.map(staff => ({
        id: staff.profile_id,
        email: staff.email || "",
        first_name: staff.first_name || undefined,
        last_name: staff.last_name || undefined,
        role: staff.role_id ? {
          id: staff.role_id,
          name: staff.role_name || "",
          nicename: staff.role_nicename || ""
        } : undefined,
        position: staff.position,
        department: staff.department,
        employee_id: staff.employee_id,
        status: staff.status
      }));

      return staffUsers;
    },
  });
};
