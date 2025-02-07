
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { MediaUploadField } from "@/components/work-orders/form-fields/MediaUploadField"

const formSchema = z.object({
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.string().min(4, "Valid year required"),
  vehicle_vin: z.string().min(1, "VIN is required"),
  description: z.string().min(1, "Please describe the service you need"),
  service_id: z.string().min(1, "Please select a service")
})

export function QuoteRequestForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('status', 'active')
      
      if (error) throw error
      return data
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear().toString(),
      vehicle_vin: "",
      description: "",
      service_id: ""
    }
  })

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const filePath = `${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('quote-request-media')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('quote-request-media')
        .getPublicUrl(filePath)

      setMediaUrl(publicUrl)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error uploading file",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      
      // Create quote request
      const { error: requestError } = await supabase
        .from('quote_requests')
        .insert([{
          client_id: user.id,
          status: 'pending',
          vehicle_make: values.vehicle_make,
          vehicle_model: values.vehicle_model,
          vehicle_year: parseInt(values.vehicle_year),
          vehicle_vin: values.vehicle_vin,
          description: values.description,
          service_id: values.service_id,
          media_url: mediaUrl
        }])

      if (requestError) throw requestError

      toast({
        title: "Quote request submitted",
        description: "We'll review your request and get back to you soon.",
      })
      
      form.reset()
      setMediaUrl(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicle_make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Make</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Camry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle VIN</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe the service you need..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MediaUploadField
              onFileUpload={handleFileUpload}
              mediaUrl={mediaUrl}
              uploading={uploading}
              onMediaRemove={() => setMediaUrl(null)}
              label="Upload Vehicle Images"
              description="Upload images of your vehicle to help us better understand your service needs."
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Quote Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
