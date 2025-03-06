
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isWithinInterval, parseISO, format } from "date-fns";

export interface BlockedDate {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export function useBlockedDates() {
  const { data: blockedDates = [], isLoading, error } = useQuery({
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

      return data as BlockedDate[];
    }
  });

  const isDateBlocked = (date: Date) => {
    if (!blockedDates.length) return false;
    
    return blockedDates.some(blockedDate => {
      const startDate = parseISO(blockedDate.start_date);
      const endDate = parseISO(blockedDate.end_date);
      
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
  };

  const getBlockedDateReason = (date: Date): string | null => {
    if (!blockedDates.length) return null;
    
    const blockedDate = blockedDates.find(blocked => {
      const startDate = parseISO(blocked.start_date);
      const endDate = parseISO(blocked.end_date);
      
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
    
    return blockedDate?.reason || `Blocked from ${format(parseISO(blockedDate?.start_date || ''), 'MMM d')} to ${format(parseISO(blockedDate?.end_date || ''), 'MMM d')}`;
  };

  return { 
    blockedDates, 
    isDateBlocked, 
    getBlockedDateReason,
    isLoading, 
    error 
  };
}
