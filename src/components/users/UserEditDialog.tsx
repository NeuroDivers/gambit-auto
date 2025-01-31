import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserEditFormFields, formSchema } from "./UserEditFormFields";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

type UserRole = "admin" | "manager" | "sidekick" | "client";

type UserEditDialogProps = {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_roles: {
      role: UserRole;
    } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const UserEditDialog = ({ user, open, onOpenChange }: UserEditDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.user_roles?.role || "client",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      if (values.role !== user.user_roles?.role) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({
            user_id: user.id,
            role: values.role,
          });

        if (roleError) throw roleError;
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <UserEditFormFields 
              form={form}
              defaultValues={form.getValues()}
            />
            <button 
              type="submit"
              className="w-full px-4 py-2 bg-[#BB86FC] text-white rounded-lg hover:bg-[#BB86FC]/90 transition-colors"
            >
              Save Changes
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};