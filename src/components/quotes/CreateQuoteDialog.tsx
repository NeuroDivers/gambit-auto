import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QuoteForm } from "./QuoteForm"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quote</DialogTitle>
        </DialogHeader>
        <QuoteForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}