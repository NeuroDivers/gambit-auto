
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";

export interface AuthFormData {
  email: string;
  password: string;
}

interface RoleData {
  role: {
    name: string;
    nicename: string;
  };
}

export const useAuthForm = () => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleBasedRedirect = async (userId: string) => {
    try {
      // Get user role from profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          role:role_id!inner (
            name,
            nicename
          )
        `)
        .eq("id", userId)
        .single<RoleData>();

      if (profileError) throw profileError;

      // Redirect based on role
      if (profileData?.role?.name?.toLowerCase() === 'client') {
        console.log("Redirecting to client dashboard");
        navigate("/client", { replace: true });
      } else {
        console.log("Redirecting to admin dashboard");
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      console.error("Error checking role:", error);
      // Default to client route if role check fails
      navigate("/client", { replace: true });
    }
  };

  // Handle URL error parameters
  const handleUrlErrors = () => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: errorDescription?.replace(/\+/g, ' ') || "An error occurred during authentication",
      });
      // Clean up URL
      navigate("/auth", { replace: true });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      console.log("Attempting sign up with:", formData.email);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            email: formData.email,
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          throw new Error("This email is already registered. Please try logging in instead.");
        }
        throw signUpError;
      }

      if (signUpData?.user) {
        console.log("User signed up successfully, attempting immediate sign in");
        // Sign in the user immediately after signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        // Redirect based on role
        await handleRoleBasedRedirect(signUpData.user.id);
        
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      console.log("Attempting sign in with:", formData.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          throw new Error(
            "Invalid email or password. Please check your credentials and try again."
          );
        }
        throw error;
      }

      if (data?.user) {
        await handleRoleBasedRedirect(data.user.id);
      }
      
      return data;
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
    });
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleSignIn,
    handleSignUp,
    handleGoogleSignIn,
    resetForm,
  };
};
