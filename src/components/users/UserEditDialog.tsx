
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserEditFormFields, formSchema } from "./UserEditFormFields";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useUserEditSubmit } from "./hooks/useUserEditSubmit";
import { User } from "./hooks/useUserData";

type UserEditDialogProps = {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const UserEditDialog = ({ user, open, onOpenChange }: UserEditDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role?.id || "",
    },
  });

  const { handleSubmit } = useUserEditSubmit({
    userId: user.id,
    currentRole: user.role?.id,
    onSuccess: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <UserEditFormFields form={form} />
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
