
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {businessProfile?.light_logo_url ? (
        <img 
          src={businessProfile.light_logo_url}
          alt="Business Logo"
          className="h-12 w-auto object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        <Avatar className="h-12 w-12">
          <AvatarImage src="/avatars/01.png" alt="Avatar" />
          <AvatarFallback>
            {firstName?.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="text-center">
        <div className="font-medium">{firstName || 'Guest'}</div>
        {role && <div className="text-sm text-muted-foreground">{role.nicename}</div>}
      </div>
    </div>
  );
}
