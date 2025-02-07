
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useMediaUpload } from '@/components/work-orders/hooks/useMediaUpload'
import { VehicleInfoSection } from "./form-sections/VehicleInfoSection"
import { ServiceSelectionSection } from "./form-sections/ServiceSelectionSection"
import { DescriptionSection } from "./form-sections/DescriptionSection"
import { Send } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

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
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      
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

  const handleUpload = async (file: File) => {
    await handleFileUpload(file)
  }

  return (
    <div className="min-h-screen bg-[#121212] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#1A1F2C]/80 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl overflow-hidden transition-all duration-200 hover:border-[#9b87f5]/30"
          >
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Request a Quote
              </h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <VehicleInfoSection form={form} />
                    <ServiceSelectionSection form={form} services={services} />
                    <DescriptionSection 
                      form={form}
                      mediaUrl={mediaUrl}
                      uploading={uploading}
                      onFileUpload={handleUpload}
                      onMediaRemove={handleMediaRemove}
                    />
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                      </Button>
                    </div>
                  </motion.div>
                </form>
              </Form>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
