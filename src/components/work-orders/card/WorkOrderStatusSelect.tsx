import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending":
      return "text-muted-foreground bg-muted/40 border-muted/40"
    case "approved":
      return "text-blue-400 bg-[rgb(59,130,246,0.2)] border-[rgb(59,130,246,0.3)]"
    case "rejected":
      return "text-[#ea384c] bg-[rgb(234,56,76,0.2)] border-[rgb(234,56,76,0.3)]"
    case "completed":
      return "text-green-400 bg-[rgb(34,197,94,0.2)] border-[rgb(34,197,94,0.3)]"
    default:
      return ""
  }
}

type WorkOrderStatusSelectProps = {
  status: string
  quoteId: string
}

export function WorkOrderStatusSelect({ status, quoteId }: WorkOrderStatusSelectProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("work_orders")
        .update({ status: newStatus })
        .eq("id", quoteId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Work order marked as ${newStatus}`,
      })

      queryClient.invalidateQueries({ queryKey: ["workOrders"] })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Select
      defaultValue={status}
      onValueChange={updateStatus}
    >
      <SelectTrigger className={`w-[130px] ${getStatusStyles(status)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  )
}