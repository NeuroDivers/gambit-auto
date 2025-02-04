import { useToast } from "@/hooks/use-toast";
import { formSchema } from "../../UserFormFields";
import * as z from "zod";

export const useCreateUser = (onSuccess?: () => void) => {
  const { toast } = useToast();

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Creating user with values:", values);
      
      const { data: userData, error: createError } = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          role: values.role,
        }),
      }).then(res => res.json());

      if (createError) throw createError;

      if (!userData?.user?.id) {
        throw new Error('User creation failed');
      }

      console.log("User created successfully:", userData.user.id);

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