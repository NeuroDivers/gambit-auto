
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const AuthLayout = ({ 
  children, 
  title = "Welcome Back",
  description = "Sign in to access your account"
}: AuthLayoutProps) => {
  const { data: profile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="text-center space-y-2">
          {profile?.logo_url ? (
            <img 
              src={profile.logo_url} 
              alt="Business Logo" 
              className="mx-auto h-12 w-12 object-contain"
            />
          ) : (
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg" />
          )}
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
};
