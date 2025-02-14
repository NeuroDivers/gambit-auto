
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeFormFields, formSchema } from "./ServiceTypeFormFields";
import { ServicePackageList } from "./ServicePackageList";
import { ServicePackage } from "@/integrations/supabase/types/service-types";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType?: {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    description: string | null;
    price: number | null;
    duration: number | null;
    pricing_model?: 'flat_rate' | 'hourly' | 'variable';
    base_price?: number | null;
    service_type?: 'standalone' | 'sub_service' | 'bundle';
    parent_service_id?: string | null;
  } | null;
  onSuccess: () => void;
}

export const ServiceTypeDialog = ({
  open,
  onOpenChange,
  serviceType,
  onSuccess
}: ServiceTypeDialogProps) => {
  const { toast } = useToast();
  const isEditing = !!serviceType;
  const [packages, setPackages] = useState<ServicePackage[]>([]);

  const defaultValues = {
    name: "",
    status: "active",
    description: "",
    pricing_model: "flat_rate",
    base_price: "",
    duration: "",
    service_type: "standalone"
  } as const;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    if (serviceType) {
      form.reset({
        name: serviceType.name,
        status: serviceType.status,
        description: serviceType.description || "",
        pricing_model: serviceType.pricing_model || "flat_rate",
        base_price: serviceType.base_price?.toString() || "",
        duration: serviceType.duration?.toString() || "",
        service_type: serviceType.service_type || "standalone",
        parent_service_id: serviceType.parent_service_id || undefined
      });
      fetchPackages();
    } else {
      form.reset(defaultValues);
      setPackages([]);
    }
  }, [serviceType, form]);

  const fetchPackages = async () => {
    if (!serviceType?.id) return;
    const { data, error } = await supabase
      .from("service_packages")
      .select("*")
      .eq("service_id", serviceType.id)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setPackages(data);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = {
        name: values.name,
        status: values.status,
        description: values.description || null,
        pricing_model: values.pricing_model,
        base_price: values.base_price ? parseFloat(values.base_price) : null,
        duration: values.duration ? parseInt(values.duration) : null,
        service_type: values.service_type,
        hierarchy_type: values.service_type === 'sub_service' ? 'sub' : 'main',
        requires_main_service: values.service_type === 'sub_service',
        can_be_standalone: values.service_type !== 'sub_service',
        parent_service_id: values.parent_service_id || null
      };

      if (isEditing && serviceType) {
        const { error } = await supabase
          .from("service_types")
          .update(data)
          .eq("id", serviceType.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("service_types")
          .insert([data]);
        if (error) throw error;
      }

      toast({
        title: `Service type ${isEditing ? "updated" : "created"}`,
        description: `Successfully ${isEditing ? "updated" : "created"} service type "${values.name}"`
      });

      // Reset form if it's a new service type
      if (!isEditing) {
        form.reset(defaultValues);
      }
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Service Type" : "Create Service Type"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            {isEditing && <TabsTrigger value="packages">Packages</TabsTrigger>}
          </TabsList>

          <TabsContent value="details">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <ServiceTypeFormFields form={form} />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isEditing ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {isEditing && (
            <TabsContent value="packages">
              <ServicePackageList 
                serviceId={serviceType.id} 
                packages={packages} 
                onPackagesChange={fetchPackages} 
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
