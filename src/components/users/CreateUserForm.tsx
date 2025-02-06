import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

export function CreateUserForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user", // Default role
    firstName: "",
    lastName: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: formData
      })

      if (error) throw error
      
      toast.success("User created successfully!")
      setFormData({ email: "", password: "", role: "user", firstName: "", lastName: "" })
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(error.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input name="lastName" type="text" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input name="role" type="text" value={formData.role} onChange={handleChange} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </div>
  )
}