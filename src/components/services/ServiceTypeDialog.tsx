import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive"]),
  description: z.string().optional(),
  price: z.string().optional(),
  duration: z.string().optional(),
});

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
      name: serviceType?.name || "",
      status: serviceType?.status || "active",
      description: serviceType?.description || "",
      price: serviceType?.price?.toString() || "",
      duration: serviceType?.duration?.toString() || "",
    },
  });

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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/[0.87]">Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-[#242424] border-white/10 text-white/[0.87]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/[0.87]">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#242424] border-white/10 text-white/[0.87]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#242424] border-white/10">
                      <SelectItem value="active" className="text-white/[0.87]">Active</SelectItem>
                      <SelectItem value="inactive" className="text-white/[0.87]">Inactive</SelectItem>
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
                  <FormLabel className="text-white/[0.87]">Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-[#242424] border-white/10 text-white/[0.87]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/[0.87]">Price (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      className="bg-[#242424] border-white/10 text-white/[0.87]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/[0.87]">Duration in minutes (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      className="bg-[#242424] border-white/10 text-white/[0.87]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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