
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlockedDate } from "../types";

export function useBlockedDates() {
  const { data: blockedDates = [], isLoading } = useQuery({
    queryKey: ["blocked-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Error fetching blocked dates:", error);
        return [];
      }
      
      return data as BlockedDate[];
    },
  });

  return { blockedDates, isLoading };
}
