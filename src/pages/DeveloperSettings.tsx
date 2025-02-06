import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const smtpFormSchema = z.object({
  SMTP_HOST: z.string().min(1, "SMTP host is required"),
  SMTP_PORT: z.string().min(1, "SMTP port is required"),
  SMTP_USER: z.string().min(1, "SMTP username is required"),
  SMTP_PASSWORD: z.string().min(1, "SMTP password is required"),
})

type SmtpFormValues = z.infer<typeof smtpFormSchema>

export default function DeveloperSettings() {
  const { toast } = useToast()

  const { data: smtpConfig, refetch } = useQuery({
    queryKey: ["smtp-config"],
    queryFn: async () => {
      const { data: { settings }, error } = await supabase.functions.invoke("get-smtp-config")
      if (error) throw error
      return settings
    },
  })

  const form = useForm<SmtpFormValues>({
    resolver: zodResolver(smtpFormSchema),
    defaultValues: {
      SMTP_HOST: "",
      SMTP_PORT: "",
      SMTP_USER: "",
      SMTP_PASSWORD: "",
    },
  })

  const onSubmit = async (values: SmtpFormValues) => {
    try {
      const { error } = await supabase.functions.invoke("update-smtp-config", {
        body: values,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "SMTP settings updated successfully.",
      })

      refetch()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="mb-8">
            <PageBreadcrumbs />
            <h1 className="text-3xl font-bold">Developer Settings</h1>
          </div>
        </div>
        <div className="max-w-[800px] mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure the SMTP settings for sending emails from the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="SMTP_HOST"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="smtp.example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="SMTP_PORT"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="587" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="SMTP_USER"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Username</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="user@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="SMTP_PASSWORD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Update SMTP Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}