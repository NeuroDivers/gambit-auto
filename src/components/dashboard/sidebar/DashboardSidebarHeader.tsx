
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
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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
  const checkIsDarkMode = () => {
    // Check multiple sources for dark mode
    const hasDarkClass = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const isDarkResolved = resolvedTheme === 'dark';
    const isDarkTheme = theme === 'dark';
    const isSystemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // If theme is 'system', use the system preference
    const isDark = hasDarkClass || 
                  isDarkResolved || 
                  (theme === 'system' && isSystemDark) ||
                  isDarkTheme;
    
    console.log("Dark mode detection:", {
      hasDarkClass, 
      isDarkResolved, 
      isDarkTheme, 
      isSystemDark,
      result: isDark
    });
    
    return isDark;
  };

  // Update theme state whenever theme-related variables change
  useEffect(() => {
    const darkModeActive = checkIsDarkMode();
    setIsDarkTheme(darkModeActive);
    
    console.log("Theme state updated:", {
      theme, 
      resolvedTheme, 
      isDarkTheme: darkModeActive
    });
  }, [theme, resolvedTheme]);

  // Determine which logo to display based on current theme
  const logoUrl = React.useMemo(() => {
    if (!businessProfile) return null;
    
    console.log("Logo selection - Dark mode:", isDarkTheme);
    console.log("Available logos - Dark:", businessProfile.dark_logo_url, "Light:", businessProfile.light_logo_url);
    
    if (isDarkTheme) {
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
  }, [businessProfile, isDarkTheme]);

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
