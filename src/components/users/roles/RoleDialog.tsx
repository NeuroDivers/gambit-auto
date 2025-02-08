
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nicename: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  can_be_assigned_to_bay: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: {
    id: string;
    name: string;
    nicename: string;
    description: string | null;
    can_be_assigned_to_bay: boolean;
  } | null;
  onSuccess?: () => void;
}

export const RoleDialog = ({ open, onOpenChange, role, onSuccess }: RoleDialogProps) => {
  const { toast } = useToast();
  
  // Fetch role data when editing
  const { data: roleData } = useQuery({
    queryKey: ["role", role?.id],
    queryFn: async () => {
      if (!role?.id) return null;
      console.log("Fetching role data for:", role.id);
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", role.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!role?.id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nicename: "",
      description: "",
      can_be_assigned_to_bay: true,
    },
  });

  // Update form values when role data changes
  useEffect(() => {
    if (roleData) {
      console.log("Setting form values with role data:", roleData);
      form.reset({
        name: roleData.name,
        nicename: roleData.nicename,
        description: roleData.description || "",
        can_be_assigned_to_bay: roleData.can_be_assigned_to_bay,
      });
    } else if (role) {
      console.log("Setting form values with prop data:", role);
      form.reset({
        name: role.name,
        nicename: role.nicename,
        description: role.description || "",
        can_be_assigned_to_bay: role.can_be_assigned_to_bay,
      });
    } else {
      console.log("Resetting form to empty values");
      form.reset({
        name: "",
        nicename: "",
        description: "",
        can_be_assigned_to_bay: true,
      });
    }
  }, [roleData, role, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (role?.id) {
        console.log("Updating role:", role.id, values);
        const { error } = await supabase
          .from("roles")
          .update({
            name: values.name,
            nicename: values.nicename,
            description: values.description,
            can_be_assigned_to_bay: values.can_be_assigned_to_bay,
          })
          .eq("id", role.id);

        if (error) throw error;

        toast({
          title: "Role updated",
          description: "The role has been updated successfully.",
        });
      } else {
        console.log("Creating new role:", values);
        const { error } = await supabase
          .from("roles")
          .insert({
            name: values.name,
            nicename: values.nicename,
            description: values.description,
            can_be_assigned_to_bay: values.can_be_assigned_to_bay,
          });

        if (error) throw error;

        toast({
          title: "Role created",
          description: "The role has been created successfully.",
        });
      }

      onSuccess?.();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error in role operation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technical Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter role name (e.g. project_manager)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nicename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter display name (e.g. Project Manager)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter role description"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="can_be_assigned_to_bay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Bay Assignment</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Allow this role to be assigned to service bays
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {role ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

