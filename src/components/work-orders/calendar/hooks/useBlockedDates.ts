
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { BlockedDate } from "../types";

export function useBlockedDates() {
  const queryClient = useQueryClient();

  const { data: blockedDates = [], isLoading } = useQuery({
    queryKey: ["blocked-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data as BlockedDate[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("blocked-dates-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blocked_dates",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["blocked-dates"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { blockedDates, isLoading };
}
