
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffSelectorProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  required?: boolean;
  className?: string; // Add className prop
}

export function StaffSelector({ 
  value, 
  onChange, 
  placeholder = "Assign staff member", 
  required = false,
  className 
}: StaffSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch staff members who can be assigned to service items
  const { data: staffMembers, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["staff-members-for-assignment"],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("staff_view")
          .select("profile_id, first_name, last_name, position, department")
          .eq("status", "active")
          .order("first_name");

        if (error) throw error;
        return data || [];
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleChange = (newValue: string) => {
    onChange(newValue === "unassigned" ? null : newValue);
  };

  return (
    <div className={cn("w-full", className)}>
      <Select
        value={value || "unassigned"}
        onValueChange={handleChange}
        disabled={isLoading || isLoadingStaff}
      >
        <SelectTrigger className="w-full">
          {isLoading || isLoadingStaff ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">
            {required ? "Select staff member" : "Unassigned"}
          </SelectItem>
          {staffMembers?.map((staff) => (
            <SelectItem key={staff.profile_id} value={staff.profile_id}>
              {staff.first_name} {staff.last_name} {staff.position ? `(${staff.position})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
