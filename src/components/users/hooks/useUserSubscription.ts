
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up realtime subscription for profiles and user_roles");
    
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log("Received realtime update for profiles:", payload);
          queryClient.invalidateQueries({ queryKey: ["users"] });
          
          if (payload.eventType === 'DELETE') {
            toast({
              title: "User deleted",
              description: "User has been removed successfully",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "User updated",
              description: "User information has been updated",
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "User added",
              description: "New user has been added",
            });
          }
        }
      )
      .subscribe();

    const rolesChannel = supabase
      .channel('roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log("Received realtime update for user roles:", payload);
          queryClient.invalidateQueries({ queryKey: ["users"] });
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Role updated",
              description: "User role has been updated",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up realtime subscriptions");
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(rolesChannel);
    };
  }, [queryClient, toast]);
};
