import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { roleFormSchema, type RoleFormValues } from "./RoleFormSchema";
import { useToast } from "@/hooks/use-toast";

interface UseRoleFormProps {
  role?: {
    id: string;
    name: string;
    nicename: string;
    description: string | null;
    can_be_assigned_to_bay: boolean;
  } | null;
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}

export const useRoleForm = ({ role, onSuccess, onOpenChange }: UseRoleFormProps) => {
  const { toast } = useToast();
  
  // Fetch role data when editing
  const { data: roleData } = useQuery({
    queryKey: ["role", role?.id],
    queryFn: async () => {
      if (!role?.id) return null;
      console.log("Fetching role data for:", role.id);
      const { data, error } = await supabase
        .from("roles") // Changed from "available_roles" to "roles"
        .select("*")
        .eq("id", role.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching role:", error);
        throw error;
      }
      return data;
    },
    enabled: !!role?.id,
  });

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      nicename: "",
      description: "",
      can_be_assigned_to_bay: true,
    },
  });

  // Update form values when role data changes
  useEffect(() => {
    if (roleData) {
      console.log("Setting form values with role data:", roleData);
      form.reset({
        name: roleData.name,
        nicename: roleData.nicename,
        description: roleData.description || "",
        can_be_assigned_to_bay: roleData.can_be_assigned_to_bay,
      });
    } else if (role) {
      console.log("Setting form values with prop data:", role);
      form.reset({
        name: role.name,
        nicename: role.nicename,
        description: role.description || "",
        can_be_assigned_to_bay: role.can_be_assigned_to_bay,
      });
    } else {
      console.log("Resetting form to empty values");
      form.reset({
        name: "",
        nicename: "",
        description: "",
        can_be_assigned_to_bay: true,
      });
    }
  }, [roleData, role, form]);

  const onSubmit = async (values: RoleFormValues) => {
    try {
      if (role?.id) {
        console.log("Updating role:", role.id, values);
        const { error } = await supabase
          .from("roles")
          .update({
            name: values.name,
            nicename: values.nicename,
            description: values.description,
            can_be_assigned_to_bay: values.can_be_assigned_to_bay,
          })
          .eq("id", role.id);

        if (error) throw error;

        toast({
          title: "Role updated",
          description: "The role has been updated successfully.",
        });
      } else {
        console.log("Creating new role:", values);
        const { error } = await supabase
          .from("roles")
          .insert({
            name: values.name,
            nicename: values.nicename,
            description: values.description,
            can_be_assigned_to_bay: values.can_be_assigned_to_bay,
          });

        if (error) throw error;

        toast({
          title: "Role created",
          description: "The role has been created successfully.",
        });
      }

      onSuccess?.();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error in role operation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return { form, onSubmit };
};
