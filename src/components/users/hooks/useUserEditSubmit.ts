
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { formSchema } from "../UserEditFormFields";

interface UseUserEditSubmitProps {
  userId: string;
  currentRole?: string;
  staffData?: any;
  onSuccess: () => void;
}

export const useUserEditSubmit = ({ userId, currentRole, staffData, onSuccess }: UseUserEditSubmitProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      console.log("Updating profile for user:", userId, "with values:", values);
      
      // Update the profile information - WITHOUT any address fields
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          role_id: values.role,
          email: values.email,
          phone_number: values.phone_number,
          bio: values.bio
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Format employment_date to handle empty strings
      const formattedEmploymentDate = values.employment_date 
        ? values.employment_date.trim() === "" 
          ? null 
          : values.employment_date
        : null;

      // Check if this user has staff data
      if (staffData) {
        console.log("Updating staff data with address fields:", {
          street_address: values.street_address,
          unit_number: values.unit_number,
          city: values.city,
          state_province: values.state_province,
          postal_code: values.postal_code,
          country: values.country
        });
        
        // Update staff info if it exists, including address fields
        const { error: staffError } = await supabase
          .from("staff")
          .update({
            employee_id: values.employee_id,
            position: values.position,
            department: values.department,
            status: values.status,
            employment_date: formattedEmploymentDate,
            is_full_time: values.is_full_time,
            emergency_contact_name: values.emergency_contact_name,
            emergency_contact_phone: values.emergency_contact_phone,
            // Add the address fields for staff table
            street_address: values.street_address,
            unit_number: values.unit_number,
            city: values.city,
            state_province: values.state_province,
            postal_code: values.postal_code,
            country: values.country
          })
          .eq("profile_id", userId);

        if (staffError) {
          console.error("Error updating staff data:", staffError);
          throw staffError;
        }
      } else if (values.employee_id || values.position || values.department || values.street_address) {
        console.log("Creating new staff record with address fields:", {
          street_address: values.street_address,
          unit_number: values.unit_number,
          city: values.city,
          state_province: values.state_province,
          postal_code: values.postal_code,
          country: values.country
        });
        
        // Create staff info if it doesn't exist but staff fields are provided
        const { error: newStaffError } = await supabase
          .from("staff")
          .insert({
            profile_id: userId,
            employee_id: values.employee_id,
            position: values.position,
            department: values.department,
            status: values.status || 'active',
            employment_date: formattedEmploymentDate,
            is_full_time: values.is_full_time !== undefined ? values.is_full_time : true,
            emergency_contact_name: values.emergency_contact_name,
            emergency_contact_phone: values.emergency_contact_phone,
            // Add the address fields for new staff creation
            street_address: values.street_address,
            unit_number: values.unit_number,
            city: values.city,
            state_province: values.state_province,
            postal_code: values.postal_code,
            country: values.country
          });

        if (newStaffError) {
          console.error("Error creating staff record:", newStaffError);
          throw newStaffError;
        }
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["staff-details", userId] });
      onSuccess();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
