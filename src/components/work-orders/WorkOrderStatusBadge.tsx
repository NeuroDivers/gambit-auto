import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type WorkOrderStatus = 
  | "pending"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "invoiced"
  | "estimated";

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatus;
  workOrderId?: string;
  readonly?: boolean;
}

export function WorkOrderStatusBadge({ 
  status, 
  workOrderId, 
  readonly = false 
}: WorkOrderStatusBadgeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const getVariant = (status: WorkOrderStatus) => {
    switch (status) {
      case "pending":
        return "pending";
      case "approved":
        return "pending"; // Map to existing variant
      case "rejected":
        return "rejected"; // Updated to match badge variant
      case "in_progress":
        return "in_progress";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      case "invoiced":
        return "invoiced";
      case "estimated":
        return "estimate_pending"; // Map to existing variant
      default:
        return "default";
    }
  };

  const getLabel = (status: WorkOrderStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "invoiced":
        return "Invoiced";
      case "estimated":
        return "Estimated";
      default:
        // Ensure status is treated as a string by explicitly casting it
        const statusString = String(status);
        return statusString.charAt(0).toUpperCase() + statusString.slice(1);
    }
  };

  const statusOptions: WorkOrderStatus[] = [
    "pending",
    "in_progress",
    "completed",
    "cancelled",
  ];

  const updateStatus = async (newStatus: WorkOrderStatus) => {
    if (!workOrderId || newStatus === status) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrderId);

      if (error) throw error;

      toast.success(`Status updated to ${getLabel(newStatus)}`);
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  if (readonly || !workOrderId) {
    return (
      <Badge variant={getVariant(status)}>
        {getLabel(status)}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isLoading} asChild>
        <div>
          <Badge 
            variant={getVariant(status)}
            className="cursor-pointer"
          >
            {getLabel(status)}
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {statusOptions.map((statusOption) => (
          <DropdownMenuItem
            key={statusOption}
            onClick={() => updateStatus(statusOption)}
            className={cn(
              "flex items-center justify-between",
              statusOption === "invoiced" && "opacity-60 cursor-not-allowed"
            )}
          >
            <span>{getLabel(statusOption)}</span>
            {statusOption === status && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
