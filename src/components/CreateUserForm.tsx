import { useAdminStatus } from "@/hooks/useAdminStatus"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const { isAdmin, isLoading } = useAdminStatus()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to create users.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .insert([{ email, first_name: firstName, last_name: lastName }])

      if (error) throw error

      toast({
        title: "Success",
        description: "User created successfully.",
      })

      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <Button type="submit" disabled={isLoading}>
        Create User
      </Button>
    </form>
  )
}
