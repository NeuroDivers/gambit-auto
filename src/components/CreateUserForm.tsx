import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { UserFormFields, formSchema } from "./UserFormFields"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import * as z from "zod"

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
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
      
      // Create user using the Edge Function instead of direct signup
      const { data: userData, error: createError } = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          role: values.role,
        }),
      }).then(res => res.json())

      if (createError) throw createError

      if (!userData?.user?.id) {
        throw new Error('User creation failed')
      }

      console.log("User created successfully:", userData.user.id)

      toast({
        title: "Success",
        description: "User created successfully. They will receive a verification email.",
      })

      form.reset()
      onSuccess?.()
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