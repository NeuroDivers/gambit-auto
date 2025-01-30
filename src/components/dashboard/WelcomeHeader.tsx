import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const WelcomeHeader = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      return data;
    },
  });

  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold mb-2">
        Welcome{profile?.email ? `, ${profile.email}` : ""}!
      </h1>
      <p className="text-muted-foreground">
        Manage your profile and settings below
      </p>
    </div>
  );
};