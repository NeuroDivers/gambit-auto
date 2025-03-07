
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
import { useQueryClient, useQuery } from "@tanstack/react-query"

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
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name, nicename");
      
      if (error) throw error;
      return data;
    },
  });

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
      console.log("Creating user with values:", { email, firstName, lastName, role, password })
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password,
          role,
          firstName,
          lastName
        },
      })

      if (error) {
        console.error('Error creating user:', error)
        throw error
      }

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

      // Reset form and close dialog
      setEmail("")
      setFirstName("")
      setLastName("")
      setPassword("")
      setRole("")
      onOpenChange(false)

    } catch (error: any) {
      console.error('Error creating user:', error)
      
      // Handle specific error messages from the Edge Function
      const errorMessage = error.message || error.error?.message || error.error || 'Failed to create user'
      
      // Check for common error patterns and provide user-friendly messages
      const userFriendlyMessage = errorMessage.includes('already registered') 
        ? 'A user with this email address already exists.'
        : errorMessage

      toast({
        title: "Error",
        description: userFriendlyMessage,
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
            id="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            id="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            id="email"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles?.map((role) => (
                <SelectItem 
                  key={role.id} 
                  value={role.id}
                >
                  {role.nicename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateUser} 
            disabled={isLoading || isSubmitting || !email || !firstName || !lastName || !role || !password}
          >
            Create User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
