import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeFormFields, formSchema } from "./ServiceTypeFormFields";
import * as z from "zod";
import { useEffect } from "react";

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
  } | null;
  onSuccess: () => void;
}

export const ServiceTypeDialog = ({
  open,
  onOpenChange,
  serviceType,
  onSuccess,
}: ServiceTypeDialogProps) => {
  const { toast } = useToast();
  const isEditing = !!serviceType;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: "active",
      description: "",
      price: "",
      duration: "",
    },
  });

  // Reset form with service type data when editing
  useEffect(() => {
    if (serviceType) {
      form.reset({
        name: serviceType.name,
        status: serviceType.status,
        description: serviceType.description || "",
        price: serviceType.price?.toString() || "",
        duration: serviceType.duration?.toString() || "",
      });
    } else {
      form.reset({
        name: "",
        status: "active",
        description: "",
        price: "",
        duration: "",
      });
    }
  }, [serviceType, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = {
        name: values.name,
        status: values.status,
        description: values.description || null,
        price: values.price ? parseFloat(values.price) : null,
        duration: values.duration ? parseInt(values.duration) : null,
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
        description: `Successfully ${isEditing ? "updated" : "created"} service type "${values.name}"`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E1E1E] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white/[0.87]">
            {isEditing ? "Edit Service Type" : "Create Service Type"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ServiceTypeFormFields form={form} />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-white/10 text-white/[0.87] hover:bg-[#242424] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#BB86FC] hover:bg-[#BB86FC]/90 text-white"
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};