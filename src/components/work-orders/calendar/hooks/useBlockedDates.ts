
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isWithinInterval } from "date-fns";

export function useBlockedDates() {
  const { data: blockedDates = [] } = useQuery({
    queryKey: ["blockedDates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) {
        toast.error("Failed to load blocked dates");
        throw error;
      }

      return data;
    }
  });

  const isDateBlocked = (date: Date) => {
    if (!blockedDates.length) return false;
    
    return blockedDates.some(blockedDate => {
      const startDate = new Date(blockedDate.start_date);
      const endDate = new Date(blockedDate.end_date);
      
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  return { blockedDates, isDateBlocked };
}
