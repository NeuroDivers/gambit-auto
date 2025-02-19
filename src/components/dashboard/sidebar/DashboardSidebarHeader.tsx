
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

interface DashboardSidebarHeaderProps {
  firstName?: string | null;
  onLogout: () => void;
}

export function DashboardSidebarHeader({ firstName, onLogout }: DashboardSidebarHeaderProps) {
  const { state } = useSidebar();
  const { theme, systemTheme } = useTheme();
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

  // For system theme, use systemTheme to determine dark/light
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logoUrl = currentTheme === 'dark' 
    ? businessProfile?.dark_logo_url 
    : businessProfile?.light_logo_url;

  return (
    <div className="flex flex-col items-center py-4">
      {logoUrl ? (
        <img 
          src={logoUrl}
          alt="Business Logo"
          className={`w-auto object-contain transition-all duration-300 ${state === 'expanded' ? 'h-24' : 'h-16'}`}
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
