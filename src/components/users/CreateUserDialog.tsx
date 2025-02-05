import { useState } from "react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { isAdmin, isLoading } = useAdminStatus()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const handleCreateUser = async () => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to create users.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.auth.admin.createUser({
        email,
        password: "defaultPassword", // Replace with a secure password generation method
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "User created successfully.",
      })

      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateUser} disabled={isLoading}>
            Create User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}