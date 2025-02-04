import { useToast } from "@/hooks/use-toast";
import { formSchema } from "../../UserFormFields";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateUser = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Creating user with values:", values);
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: values.email,
          password: values.password,
          role: values.role,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create user');
      }

      if (!data?.user?.id) {
        throw new Error('User creation failed - no user ID returned');
      }

      console.log("User created successfully:", data.user.id);

      // Invalidate both users and role stats queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["roleStats"] })
      ]);

      toast({
        title: "Success",
        description: "User created successfully. They will receive a verification email.",
      });

      onSuccess?.();
      return true;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create user',
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleSubmit };
};