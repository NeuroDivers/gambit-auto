import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { UserFormFields, formSchema } from "./UserFormFields"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import * as z from "zod"

export function CreateUserForm() {
  const { toast } = useToast()
  const { isAdmin, loading } = useAdminStatus()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "client",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Creating user with values:", values)
      
      // Create user directly with Supabase auth API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('User creation failed')
      }

      console.log("User created successfully:", authData.user.id)

      // Wait longer for the user creation to propagate
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create user role using RPC function with explicit error handling
      const { data: rpcData, error: roleError } = await supabase.rpc('create_user_role', {
        user_id: authData.user.id,
        role_name: values.role
      })

      if (roleError) {
        console.error('Role creation error:', roleError)
        throw new Error(`Failed to assign role to user: ${roleError.message}`)
      }

      // Wait for role creation to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify role was created with proper error handling
      const { data: roles, error: verifyError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (verifyError) {
        console.error('Role verification error:', verifyError)
        throw new Error(`Failed to verify role assignment: ${verifyError.message}`)
      }

      if (!roles) {
        console.error('No roles found for user')
        throw new Error('Role assignment failed - no roles found')
      }

      console.log("Role assigned and verified successfully:", roles.role)

      toast({
        title: "Success",
        description: "User created successfully. They will receive a verification email.",
      })

      form.reset()
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="p-4 text-white/60">Loading...</div>
  }

  if (!isAdmin) {
    return <div className="p-4 text-white/60">You need admin privileges to create new users.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-white/60">
          Add a new user to the system
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <UserFormFields form={form} />
          <Button type="submit" className="w-full">
            Create User
          </Button>
        </form>
      </Form>
    </div>
  )
}