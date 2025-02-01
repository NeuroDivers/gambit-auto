import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending":
      return "text-[rgb(250,204,21)] bg-[rgb(234,179,8,0.2)] border-[rgb(234,179,8,0.3)]"
    case "approved":
      return "text-[#0EA5E9] bg-[rgb(14,165,233,0.2)] border-[rgb(14,165,233,0.3)]"
    case "rejected":
      return "text-[#ea384c] bg-[rgb(234,56,76,0.2)] border-[rgb(234,56,76,0.3)]"
    case "completed":
      return "text-[#9b87f5] bg-[rgb(155,135,245,0.2)] border-[rgb(155,135,245,0.3)]"
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