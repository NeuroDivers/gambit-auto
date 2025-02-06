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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { isAdmin, isLoading } = useAdminStatus()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState<string>("client")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      setIsSubmitting(true)
      console.log("Creating user with values:", { email, firstName, lastName, role })
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password: "defaultPassword123!", // This should be changed by the user on first login
          role,
          firstName,
          lastName
        },
      })

      if (error) throw error

      if (!data?.user?.id) {
        throw new Error('User creation failed - no user ID returned')
      }

      console.log("User created successfully:", data.user.id)

      // Invalidate queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["roleStats"] })
      ])

      toast({
        title: "Success",
        description: "User created successfully. They will receive a verification email.",
      })

      // Reset form
      setEmail("")
      setFirstName("")
      setLastName("")
      setRole("client")
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to create user',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="sidekick">Sidekick</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateUser} 
            disabled={isLoading || isSubmitting || !email || !firstName || !lastName}
          >
            Create User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}