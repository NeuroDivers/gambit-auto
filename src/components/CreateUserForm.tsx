import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { UserFormFields, formSchema } from "./UserFormFields";
import { useCreateUser } from "./users/hooks/useCreateUser";
import * as z from "zod";

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { isAdmin, loading } = useAdminStatus();
  const { handleSubmit: submitUser } = useCreateUser(onSuccess);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "client",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await submitUser(values);
    if (success) {
      form.reset();
    }
  };

  if (loading) {
    return <div className="p-4 text-white/60">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="p-4 text-white/60">You need admin privileges to create new users.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-white/60">
          Add a new user to the system
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <UserFormFields form={form} />
          <Button type="submit" className="w-full">
            Create User
          </Button>
        </form>
      </Form>
    </div>
  );
}