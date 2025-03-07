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
  
  // Determine if dark mode is active - simplified and more reliable approach
  useEffect(() => {
    // Check if the HTML element has the dark class - this is the most reliable approach
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkTheme(isDark);
    console.log("Dark mode detection in dashboard sidebar:", { 
      htmlHasDarkClass: isDark, 
      resolvedTheme,
      theme
    });
  }, [resolvedTheme, theme]);

  // Add a theme change observer to react immediately to theme changes
  useEffect(() => {
    // Create a mutation observer to watch for class changes on the HTML element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setIsDarkTheme(isDark)
        }
      })
    })

    // Start observing the document with the configured parameters
    observer.observe(document.documentElement, { attributes: true })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, []);

  // Determine which logo to display based on current theme
  const logoUrl = React.useMemo(() => {
    if (!businessProfile) return null;
    
    console.log("Logo selection in dashboard - Dark mode:", isDarkTheme);
    console.log("Available logos - Dark:", businessProfile.dark_logo_url, "Light:", businessProfile.light_logo_url);
    
    // Use the appropriate logo based on theme
    return isDarkTheme 
      ? businessProfile.dark_logo_url 
      : businessProfile.light_logo_url;
  }, [businessProfile, isDarkTheme]);

  console.log("Final logo URL being used in dashboard:", logoUrl);

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
