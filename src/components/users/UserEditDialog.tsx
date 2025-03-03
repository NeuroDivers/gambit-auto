
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserEditFormFields, formSchema } from "./UserEditFormFields";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useUserEditSubmit } from "./hooks/useUserEditSubmit";
import { User } from "./hooks/useUserData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserEditDialogProps = {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffData?: any;
};

export const UserEditDialog = ({ user, staffData, open, onOpenChange }: UserEditDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      // Prefer staff address fields over profile address fields if available
      street_address: staffData?.street_address || user.street_address || "",
      unit_number: staffData?.unit_number || user.unit_number || "",
      city: staffData?.city || user.city || "",
      state_province: staffData?.state_province || user.state_province || "",
      postal_code: staffData?.postal_code || user.postal_code || "",
      country: staffData?.country || user.country || "",
      bio: user.bio || "",
      role: user.role?.id || "",
      // Staff specific fields
      employee_id: staffData?.employee_id || "",
      position: staffData?.position || "",
      department: staffData?.department || "",
      status: staffData?.status || "active",
      employment_date: staffData?.employment_date ? new Date(staffData.employment_date).toISOString().split('T')[0] : "",
      is_full_time: staffData?.is_full_time !== undefined ? staffData.is_full_time : true,
      emergency_contact_name: staffData?.emergency_contact_name || "",
      emergency_contact_phone: staffData?.emergency_contact_phone || "",
    },
  });

  const { handleSubmit, isSubmitting } = useUserEditSubmit({
    userId: user.id,
    currentRole: user.role?.id,
    staffData: staffData,
    onSuccess: () => onOpenChange(false),
  });

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name, nicename")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card text-card-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <UserEditFormFields 
              form={form} 
              roles={roles || []} 
              showStaffFields={!!staffData}
            />
            <div className="flex justify-end">
              <Button 
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
