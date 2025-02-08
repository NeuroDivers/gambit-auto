
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "admin" | "manager" | "sidekick" | "client";
};

export const useUserData = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users...");
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, role");

      if (profilesError) throw profilesError;

      return profiles as User[];
    },
  });
};
