
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface DeleteInvoiceDialogProps {
  invoiceId: string
  invoiceNumber: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteInvoiceDialog({
  invoiceId,
  invoiceNumber,
  open,
  onOpenChange,
}: DeleteInvoiceDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      // First, add a record to audit_logs to avoid constraint violation
      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert({
          entity_id: invoiceId,
          entity_type: "invoice",
          action_type: "delete",
          user_id: (await supabase.auth.getUser()).data.user?.id,
          details: { invoice_number: invoiceNumber }
        })
      
      if (auditError) {
        console.log("Audit log creation error, continuing with deletion:", auditError)
        // Continue with deletion even if audit logging fails
      }
      
      // Delete all invoice items first (cascade doesn't work with foreign keys in Supabase)
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoiceId)
      
      if (itemsError) {
        console.error("Error deleting invoice items:", itemsError)
        toast.error("Failed to delete invoice items")
        return
      }
      
      // Then delete the invoice
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId)
      
      if (error) {
        console.error("Error deleting invoice:", error)
        toast.error("Failed to delete invoice")
        return
      }
      
      toast.success("Invoice deleted successfully")
      onOpenChange(false)
      
      // Navigate back to invoices list
      navigate("/invoices")
    } catch (error) {
      console.error("Error in delete operation:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Invoice {invoiceNumber}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            invoice and all its items from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Invoice"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
