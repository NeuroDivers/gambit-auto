import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRoleSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up realtime subscription for user roles and profiles");
    
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
          queryClient.invalidateQueries({ queryKey: ["roleStats"] });
          
          if (payload.eventType === 'DELETE') {
            toast({
              title: "Role removed",
              description: "User role has been removed",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Role updated",
              description: "User role has been updated",
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "Role added",
              description: "New user role has been added",
            });
          }
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log("Received realtime update for profiles:", payload);
          queryClient.invalidateQueries({ queryKey: ["roleStats"] });
          
          toast({
            title: "User deleted",
            description: "User and associated role have been removed",
          });
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up realtime subscriptions");
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [queryClient, toast]);
};