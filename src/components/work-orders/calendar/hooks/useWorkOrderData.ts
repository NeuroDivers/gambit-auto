
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "../../types";
import { BlockedDate } from "../types";

export function useWorkOrderData() {
  // Fetch work orders
  const { data: workOrders = [], isLoading: isLoadingWorkOrders } = useQuery({
    queryKey: ["calendar-work-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .not("start_time", "is", null)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as WorkOrder[];
    },
  });

  // Fetch blocked dates
  const { data: blockedDates = [], isLoading: isLoadingBlockedDates } = useQuery({
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

  return {
    workOrders,
    blockedDates,
    isLoading: isLoadingWorkOrders || isLoadingBlockedDates,
  };
}
