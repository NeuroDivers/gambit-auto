
import { Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { WorkOrder } from "../types"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { WorkOrderStatusBadge } from "../WorkOrderStatusBadge"

type Status = "pending" | "in_progress" | "completed" | "cancelled" | "invoiced"

const statusLabels: Record<Status, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  invoiced: "Invoiced",
}

interface WorkOrderStatusSelectProps {
  workOrder: WorkOrder
}

export function WorkOrderStatusSelect({ workOrder }: WorkOrderStatusSelectProps) {
  // We're now just using the WorkOrderStatusBadge component with dropdown functionality
  return (
    <WorkOrderStatusBadge status={workOrder.status} workOrderId={workOrder.id} />
  )
}
