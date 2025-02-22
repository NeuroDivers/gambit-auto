import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
interface RoleStatsCardProps {
  role: string;
  count: number;
  onRoleSelect?: (role: string) => void;
}
export const RoleStatsCard = ({
  role,
  count,
  onRoleSelect
}: RoleStatsCardProps) => {
  const {
    data: roleInfo
  } = useQuery({
    queryKey: ["role", role],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("roles").select("nicename").eq("name", role).maybeSingle();
      if (error) {
        console.error("Error fetching role info:", error);
        return null;
      }
      return data;
    }
  });
  const handleClick = () => {
    if (onRoleSelect) {
      onRoleSelect(role);
    }
  };

  // Format the role name nicely if no nicename is found
  const displayName = roleInfo?.nicename || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer hover:bg-card/70" onClick={handleClick}>
      
    </Card>;
};