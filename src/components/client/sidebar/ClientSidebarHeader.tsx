
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

  const { data: businessProfile, isLoading } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .single();
      
      if (error) throw error;
      console.log("Fetched business profile in client sidebar:", data);
      return data;
    }
  });

  // Determine if dark mode is active - simplified and more reliable approach
  useEffect(() => {
    // Check if the HTML element has the dark class - this is the most reliable approach
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkTheme(isDark);
    console.log("Dark mode detection in client sidebar:", { 
      htmlHasDarkClass: isDark, 
      resolvedTheme,
      theme
    });
  }, [resolvedTheme, theme]);

  // Get the appropriate logo URL based on current theme
  const logoUrl = React.useMemo(() => {
    if (!businessProfile) return null;
    
    console.log("Logo selection in client sidebar - Dark mode:", isDarkTheme);
    console.log("Available logos - Dark:", businessProfile.dark_logo_url, "Light:", businessProfile.light_logo_url);
    
    if (isDarkTheme) {
      // For dark theme: Use dark_logo_url, fall back to logo_url
      return businessProfile.dark_logo_url || businessProfile.logo_url;
    } else {
      // For light theme: Use light_logo_url, fall back to logo_url
      return businessProfile.light_logo_url || businessProfile.logo_url;
    }
  }, [businessProfile, isDarkTheme]);

  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex flex-col items-center py-4">
      {isLoading ? (
        <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
      ) : logoUrl ? (
        <img 
          src={logoUrl}
          alt="Business Logo"
          className="h-16 w-auto object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            console.error("Failed to load logo in client sidebar:", logoUrl);
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
