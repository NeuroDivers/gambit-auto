
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
      console.log("Updating profile for user:", userId, "with values:", values);
      
      // Update the profile with the new role_id directly since we're now passing the role ID
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          role_id: values.role
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};
