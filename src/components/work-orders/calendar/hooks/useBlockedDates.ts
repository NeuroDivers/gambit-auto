
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isWithinInterval, parseISO, format, addDays } from "date-fns";

export interface BlockedDate {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export function useBlockedDates() {
  const queryClient = useQueryClient();
  const { data: blockedDates = [], isLoading, error } = useQuery({
    queryKey: ["blockedDates"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("blocked_dates")
          .select("*")
          .order("start_date", { ascending: true });

        if (error) {
          throw error;
        }

        return data as BlockedDate[];
      } catch (error: any) {
        toast.error("Failed to load blocked dates");
        console.error("Error loading blocked dates:", error.message);
        return [];
      }
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

  const getBlockedDateInfo = (date: Date): { reason: string | null; dates: string } | null => {
    if (!blockedDates.length) return null;
    
    const blockedDate = blockedDates.find(blocked => {
      const startDate = parseISO(blocked.start_date);
      const endDate = parseISO(blocked.end_date);
      
      return isWithinInterval(date, { start: startDate, end: endDate });
    });
    
    if (!blockedDate) return null;
    
    const startFormat = format(parseISO(blockedDate.start_date), 'MMM d');
    const endFormat = format(parseISO(blockedDate.end_date), 'MMM d');
    const dateRange = startFormat === endFormat ? startFormat : `${startFormat} to ${endFormat}`;
    
    return { 
      reason: blockedDate.reason, 
      dates: dateRange
    };
  };

  const getBlockedDateReason = (date: Date): string | null => {
    const info = getBlockedDateInfo(date);
    if (!info) return null;
    
    return info.reason 
      ? `${info.reason} (${info.dates})` 
      : `Blocked: ${info.dates}`;
  };

  const addBlockedDate = async (startDate: Date, endDate: Date, reason: string | null = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error, data } = await supabase
        .from("blocked_dates")
        .insert([{ 
          start_date: format(startDate, 'yyyy-MM-dd'), 
          end_date: format(endDate, 'yyyy-MM-dd'),
          reason,
          created_by: user?.id || null
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Add to cache immediately for UI response
      queryClient.setQueryData(["blockedDates"], (old: BlockedDate[] | undefined) => {
        return [...(old || []), data as BlockedDate];
      });
      
      toast.success("Date blocked successfully");
      return true;
    } catch (error: any) {
      console.error("Error adding blocked date:", error);
      toast.error(error.message || "Failed to block date");
      return false;
    }
  };

  const removeBlockedDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Remove from cache immediately for UI response
      queryClient.setQueryData(["blockedDates"], (old: BlockedDate[] | undefined) => {
        return (old || []).filter(date => date.id !== id);
      });
      
      toast.success("Date unblocked successfully");
      return true;
    } catch (error: any) {
      console.error("Error removing blocked date:", error);
      toast.error(error.message || "Failed to unblock date");
      return false;
    }
  };

  return { 
    blockedDates, 
    isDateBlocked, 
    getBlockedDateInfo,
    getBlockedDateReason,
    addBlockedDate,
    removeBlockedDate,
    isLoading, 
    error 
  };
}
