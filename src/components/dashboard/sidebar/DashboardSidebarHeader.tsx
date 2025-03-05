
import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
  const { state } = useSidebar();
  const { theme, resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);

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

  // Update currentTheme whenever theme or resolvedTheme changes
  useEffect(() => {
    setCurrentTheme(theme === 'system' ? resolvedTheme : theme);
  }, [theme, resolvedTheme]);

  // Get the appropriate logo URL based on current theme
  const logoUrl = currentTheme === 'dark' 
    ? businessProfile?.dark_logo_url || businessProfile?.logo_url
    : businessProfile?.light_logo_url || businessProfile?.logo_url;

  return (
    <div className="relative py-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-2" 
        onClick={onLogout}
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign out</span>
      </Button>
      <div className="flex flex-col items-center">
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
    </div>
  );
}
