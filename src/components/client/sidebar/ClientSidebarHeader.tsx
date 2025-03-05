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

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkTheme(isDark);
    console.log("Dark mode detection in client sidebar:", { 
      htmlHasDarkClass: isDark, 
      resolvedTheme,
      theme
    });
  }, [resolvedTheme, theme]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setIsDarkTheme(isDark)
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })

    return () => {
      observer.disconnect()
    }
  }, []);

  const logoUrl = React.useMemo(() => {
    if (!businessProfile) return null;
    
    console.log("Logo selection in client sidebar - Dark mode:", isDarkTheme);
    console.log("Available logos - Dark:", businessProfile.dark_logo_url, "Light:", businessProfile.light_logo_url);
    
    return isDarkTheme 
      ? businessProfile.dark_logo_url 
      : businessProfile.light_logo_url;
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
          <AvatarFallback>
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
