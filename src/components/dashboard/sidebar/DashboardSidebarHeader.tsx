
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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);

  // Query to fetch business profile data including logo URLs
  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .single();
      
      if (error) throw error;
      console.log("Fetched business profile:", data);
      return data;
    }
  });
  
  // Check if we're in dark mode by examining document classes
  const isDarkMode = () => {
    // Check if document exists (for SSR compatibility)
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  };

  // Get the current system theme
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Update currentTheme whenever theme-related variables change
  useEffect(() => {
    // Try to determine the theme from various sources
    const documentHasDarkClass = isDarkMode();
    const systemTheme = getSystemTheme();
    
    // Debug information
    console.log({
      selectedTheme: theme,
      resolvedTheme: resolvedTheme,
      currentSystemTheme: systemTheme,
      documentClassList: documentHasDarkClass ? "has dark class" : "no dark class"
    });
    
    // Set the current theme based on the most reliable information
    if (documentHasDarkClass) {
      setCurrentTheme('dark');
    } else if (resolvedTheme) {
      setCurrentTheme(resolvedTheme);
    } else if (theme) {
      setCurrentTheme(theme);
    } else {
      setCurrentTheme(systemTheme);
    }
  }, [theme, resolvedTheme]);

  // Determine which logo to display based on current theme
  const logoUrl = React.useMemo(() => {
    if (!businessProfile) return null;
    
    // Check multiple sources to determine if dark mode is active
    const isDark = 
      currentTheme === 'dark' || 
      resolvedTheme === 'dark' || 
      isDarkMode();
    
    console.log("Determining logo for theme:", currentTheme);
    console.log("Available logos - Dark:", businessProfile.dark_logo_url, "Light:", businessProfile.light_logo_url);
    
    if (isDark) {
      // For dark theme: Use dark_logo_url, fall back to logo_url
      const darkLogo = businessProfile.dark_logo_url || businessProfile.logo_url;
      console.log("Using dark logo:", darkLogo);
      return darkLogo;
    } else {
      // For light theme: Use light_logo_url, fall back to logo_url
      const lightLogo = businessProfile.light_logo_url || businessProfile.logo_url;
      console.log("Using light logo:", lightLogo);
      return lightLogo;
    }
  }, [businessProfile, currentTheme, resolvedTheme]);

  console.log("Final logo URL being used:", logoUrl);

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
              console.error("Failed to load logo:", logoUrl);
            }}
          />
        ) : (
          <div className="text-2xl font-bold">Admin Panel</div>
        )}
      </div>
    </div>
  );
}
