
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { QuoteForm } from "./QuoteForm"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CreateQuoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateQuoteDialog({ open, onOpenChange }: CreateQuoteDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSuccess = async () => {
    toast({
      title: "Success",
      description: "Quote created successfully",
    })
    onOpenChange(false)
    await queryClient.invalidateQueries({ queryKey: ["quotes"] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-screen flex flex-col animate-slide-in-right data-[state=closed]:animate-slide-out-right">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl">Create Quote</DialogTitle>
          <DialogDescription>
            Create a new quote for your customer.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="pb-6">
            <QuoteForm onSuccess={handleSuccess} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
