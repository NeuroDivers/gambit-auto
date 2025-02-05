import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

const getStatusStyles = (status: string) => {
  switch (status) {
    case "draft":
      return "text-muted-foreground bg-muted/40 border-muted/40"
    case "pending":
      return "text-blue-400 bg-[rgb(59,130,246,0.2)] border-[rgb(59,130,246,0.3)]"
    case "approved":
      return "text-green-400 bg-[rgb(34,197,94,0.2)] border-[rgb(34,197,94,0.3)]"
    case "rejected":
      return "text-[#ea384c] bg-[rgb(234,56,76,0.2)] border-[rgb(234,56,76,0.3)]"
    case "converted":
      return "text-purple-400 bg-[rgb(168,85,247,0.2)] border-[rgb(168,85,247,0.3)]"
    default:
      return ""
  }
}

type QuoteStatusSelectProps = {
  status: string
  quoteId: string
}

export function QuoteStatusSelect({ status, quoteId }: QuoteStatusSelectProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status: newStatus })
        .eq("id", quoteId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Quote marked as ${newStatus}`,
      })

      queryClient.invalidateQueries({ queryKey: ["quotes"] })
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
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="approved">Approved</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  )
}