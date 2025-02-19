
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardSidebarHeaderProps {
  firstName?: string | null;
  role?: {
    id: string;
    name: string;
    nicename: string;
  } | null;
  onLogout: () => void;
}

export function DashboardSidebarHeader({ firstName, role, onLogout }: DashboardSidebarHeaderProps) {
  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="flex flex-col items-center py-4">
      {businessProfile?.light_logo_url ? (
        <img 
          src={businessProfile.light_logo_url}
          alt="Business Logo"
          className="h-16 w-auto object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        <div className="text-2xl font-bold">Admin Panel</div>
      )}
    </div>
  );
}
