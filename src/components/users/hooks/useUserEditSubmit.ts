import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { formSchema } from "../UserEditFormFields";

interface UseUserEditSubmitProps {
  userId: string;
  currentRole?: string;
  onSuccess: () => void;
}

export const useUserEditSubmit = ({ userId, currentRole, onSuccess }: UseUserEditSubmitProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Update profile information (first_name and last_name)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Update role if changed
      if (values.role !== currentRole) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({
            user_id: userId,
            role: values.role,
          });

        if (roleError) throw roleError;
      }

      // Update work order assignments if role is sidekick
      if (values.role === "sidekick" && values.assigned_work_orders) {
        const { error: workOrderError } = await supabase
          .from("work_orders")
          .update({ assigned_sidekick_id: null })
          .eq("assigned_sidekick_id", userId);

        if (workOrderError) throw workOrderError;

        for (const workOrderId of values.assigned_work_orders) {
          const { error: assignError } = await supabase
            .from("work_orders")
            .update({ assigned_sidekick_id: userId })
            .eq("id", workOrderId);

          if (assignError) throw assignError;
        }
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};