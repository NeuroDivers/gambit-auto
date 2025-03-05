
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { applyThemeClass } from "@/utils/themeUtils";

export default function ProfileSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<{
    id: string
    email: string
    first_name: string
    last_name: string
  } | null>(null)

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  })

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error) {
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive",
          })
        } else {
          setProfile({
            id: user.id,
            email: user.email || "",
            first_name: profileData?.first_name || "",
            last_name: profileData?.last_name || "",
          })
          form.reset({
            firstName: profileData?.first_name || "",
            lastName: profileData?.last_name || "",
            email: user.email || "",
          })
        }
      }
      setLoading(false)
    }

    getProfile()
  }, [form, toast])

  const onSubmit = async (values: any) => {
    setLoading(true)
    const { error } = await supabase.from("profiles").update({
      first_name: values.firstName,
      last_name: values.lastName,
    }).eq("id", profile?.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    }
    setLoading(false)
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your profile information and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="First Name"
                {...form.register("firstName")}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Last Name"
                {...form.register("lastName")}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              {...form.register("email")}
              disabled
            />
          </div>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
