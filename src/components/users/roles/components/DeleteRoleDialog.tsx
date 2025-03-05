
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
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface DeleteRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleId?: string
  onSuccess?: () => void
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  roleId,
  onSuccess,
}: DeleteRoleDialogProps) {
  const handleDelete = async () => {
    if (!roleId) return

    try {
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", roleId)

      if (error) throw error

      toast("Role deleted", {
        description: "The role has been successfully deleted",
      })

      onSuccess?.()
    } catch (error: any) {
      toast("Error", {
        description: error.message,
        style: { backgroundColor: 'red', color: 'white' }
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the role
            and remove it from all users.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
