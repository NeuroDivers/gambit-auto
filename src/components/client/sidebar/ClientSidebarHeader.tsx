
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";

interface ClientSidebarHeaderProps {
  firstName?: string | null;
  role?: {
    id: string;
    name: string;
    nicename: string;
  } | null;
  onLogout: () => void;
}

export function ClientSidebarHeader({ firstName, role, onLogout }: ClientSidebarHeaderProps) {
  const { theme, resolvedTheme } = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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

  // Determine if dark mode is active
  useEffect(() => {
    // Simple check - if resolvedTheme is available, use it directly
    if (resolvedTheme) {
      setIsDarkTheme(resolvedTheme === 'dark');
    }
  }, [resolvedTheme]);

  // Get the appropriate logo URL based on current theme
  const logoUrl = isDarkTheme 
    ? businessProfile?.dark_logo_url || businessProfile?.logo_url
    : businessProfile?.light_logo_url || businessProfile?.logo_url;

  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex flex-col items-center py-4">
      {logoUrl ? (
        <img 
          src={logoUrl}
          alt="Business Logo"
          className="h-16 w-auto object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
