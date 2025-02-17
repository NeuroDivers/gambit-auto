
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { VehicleInfoSection } from "./form-sections/VehicleInfoSection";
import { ServiceSelectionSection } from "./form-sections/ServiceSelectionSection";
import { DescriptionSection } from "./form-sections/DescriptionSection";

const formSchema = z.object({
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.string().min(4, "Valid year required"),
  vehicle_vin: z.string().min(1, "VIN is required"),
  description: z.string().min(1, "Please describe the service you need"),
  service_ids: z.array(z.string()).min(1, "Please select at least one service")
});

export function QuoteRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const {
    data: services = []
  } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

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
  });

  const handleFileUpload = async (files: FileList) => {
    try {
      setUploading(true);
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('quote-request-media')
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('quote-request-media')
          .getPublicUrl(filePath);
        newUrls.push(filePath);
      }
      setMediaUrls(prev => [...prev, ...newUrls]);
      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`);
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleMediaRemove = async (urlToRemove: string) => {
    try {
      const { error: deleteError } = await supabase.storage
        .from('quote-request-media')
        .remove([urlToRemove]);
      if (deleteError) throw deleteError;
      setMediaUrls(prev => prev.filter(url => url !== urlToRemove));
      toast.success('Image removed successfully');
    } catch (error: any) {
      toast.error('Error removing image: ' + error.message);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create quote request with media_urls included
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
          media_urls: mediaUrls
        }]);

      if (requestError) throw requestError;
      toast.success("Quote request submitted successfully");
      form.reset();
      setMediaUrls([]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <VehicleInfoSection form={form} />
            <ServiceSelectionSection form={form} services={services} />
            <DescriptionSection form={form} />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Quote Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
