import { Button } from "@/components/ui/button"
import { QuoteRequest } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

type QuoteCardActionsProps = {
  request: QuoteRequest
}

export function QuoteCardActions({ request }: QuoteCardActionsProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from("quote_requests")
        .update({ status })
        .eq("id", request.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Quote request marked as ${status}`,
      })

      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (request.status === "pending") {
    return (
      <div className="flex gap-2 justify-end pt-3 border-t border-border/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateStatus("rejected")}
          className="hover:bg-destructive/20"
        >
          Reject
        </Button>
        <Button
          size="sm"
          onClick={() => updateStatus("approved")}
          className="hover:bg-primary/20"
        >
          Approve
        </Button>
      </div>
    )
  }

  return null
}