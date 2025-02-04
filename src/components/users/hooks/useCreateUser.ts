import { useToast } from "@/hooks/use-toast";
import { formSchema } from "../../UserFormFields";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";

export const useCreateUser = (onSuccess?: () => void) => {
  const { toast } = useToast();

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

      if (error) throw error;

      if (!data?.user?.id) {
        throw new Error('User creation failed');
      }

      console.log("User created successfully:", data.user.id);

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
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleSubmit };
};