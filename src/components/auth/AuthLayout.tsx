
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
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center space-y-4">
          {profile?.logo_url ? (
            <div className="mb-6">
              <img 
                src={profile.logo_url} 
                alt="Business Logo" 
                className="mx-auto h-20 w-auto max-w-[200px] object-contain drop-shadow-md"
              />
            </div>
          ) : (
            <div className="mx-auto h-20 w-20 bg-primary/10 rounded-lg mb-6" />
          )}
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
};
