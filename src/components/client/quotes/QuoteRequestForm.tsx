
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
import { useQuery } from "@tanstack/react-query"
import { MediaUploadField } from "@/components/work-orders/form-fields/MediaUploadField"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.string().min(4, "Valid year required"),
  vehicle_vin: z.string().min(1, "VIN is required"),
  description: z.string().min(1, "Please describe the service you need"),
  service_ids: z.array(z.string()).min(1, "Please select at least one service")
})

export function QuoteRequestForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { useMediaUpload } = require('@/components/work-orders/hooks/useMediaUpload')
  const { mediaUrl, uploading, handleFileUpload, handleMediaRemove } = useMediaUpload('quote-request-media')

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
      service_ids: []
    }
  })

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
          service_ids: values.service_ids,
          media_url: mediaUrl
        }])

      if (requestError) throw requestError

      toast({
        title: "Quote request submitted",
        description: "We'll review your request and get back to you soon.",
      })
      
      form.reset()
      handleMediaRemove()
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
              name="service_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Service Types</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <FormField
                        key={service.id}
                        control={form.control}
                        name="service_ids"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={service.id}
                              className="flex flex-col items-start space-y-0"
                            >
                              <FormControl>
                                <Card
                                  className={`w-full cursor-pointer transition-all ${
                                    field.value?.includes(service.id)
                                      ? "border-primary bg-primary/5"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    const current = field.value || []
                                    const updated = current.includes(service.id)
                                      ? current.filter((id) => id !== service.id)
                                      : [...current, service.id]
                                    field.onChange(updated)
                                  }}
                                >
                                  <CardContent className="flex items-center space-x-4 p-4">
                                    <Checkbox
                                      checked={field.value?.includes(service.id)}
                                      onCheckedChange={() => {
                                        const current = field.value || []
                                        const updated = current.includes(service.id)
                                          ? current.filter((id) => id !== service.id)
                                          : [...current, service.id]
                                        field.onChange(updated)
                                      }}
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-medium">{service.name}</h4>
                                      {service.price && (
                                        <p className="text-sm text-muted-foreground">
                                          Starting from ${service.price}
                                        </p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </FormControl>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
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
              onMediaRemove={handleMediaRemove}
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
