
import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RoleStatsCardProps {
  role: string;
  count: number;
}

export const RoleStatsCard = ({ role, count }: RoleStatsCardProps) => {
  const { data: roleInfo } = useQuery({
    queryKey: ["role", role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("nicename")
        .eq("name", role)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/[0.08] hover:border-primary/50 transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold capitalize text-white/[0.87]">
              {roleInfo?.nicename || role}
            </p>
            <p className="text-sm text-white/60">
              {count} {count === 1 ? 'user' : 'users'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
