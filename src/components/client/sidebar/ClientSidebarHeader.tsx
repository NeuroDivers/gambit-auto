
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?';

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
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
