
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserEditFormFields } from "./UserEditFormFields";

export const formSchema = z.object({
  role: z.string(),
  first_name: z.string(),
  last_name: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface UserEditDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: {
      id: string;
      name: string;
      nicename: string;
    };
  };
}

export const UserEditDialog = ({
  userId,
  open,
  onOpenChange,
  onSuccess,
  user,
}: UserEditDialogProps) => {
  const { toast } = useToast();

  // Fetch user data only if not provided through props
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          *,
          role:roles (
            id,
            name,
            nicename
          )
        `)
        .eq("id", userId)
        .single();
      return profile;
    },
    enabled: open && !!userId && !user, // Only fetch if user is not provided
  });

  const activeData = user || userData;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      first_name: "",
      last_name: "",
    },
    values: activeData
      ? {
          role: activeData.role?.id || "",
          first_name: activeData.first_name || "",
          last_name: activeData.last_name || "",
        }
      : undefined,
  });

  const onSubmit = async (values: FormData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role_id: values.role,
          first_name: values.first_name,
          last_name: values.last_name,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User information updated successfully.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and role assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <UserEditFormFields form={form} />
        </form>
      </DialogContent>
    </Dialog>
  );
};
