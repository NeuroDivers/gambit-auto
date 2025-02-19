
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleBasedRedirect = async (userId: string) => {
    try {
      console.log("Checking user role for redirect...");
      
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

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      if (!profileData?.role) {
        console.error("No role found for user");
        navigate("/unauthorized", { replace: true });
        return;
      }

      console.log("User role found:", profileData.role);
      
      // Redirect based on role
      if (profileData.role.name.toLowerCase() === 'client') {
        navigate("/client", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      console.error("Error during role-based redirect:", error);
      navigate("/unauthorized", { replace: true });
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
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
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
        password: formData.password
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          throw new Error("This email is already registered. Please try logging in instead.");
        }
        throw signUpError;
      }

      if (signUpData?.user) {
        console.log("User signed up successfully:", signUpData.user.id);
        toast.success("Your account has been created successfully!");
        
        // Wait for the trigger to complete profile creation
        setTimeout(async () => {
          await handleRoleBasedRedirect(signUpData.user.id);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account");
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
          throw new Error("Invalid email or password. Please check your credentials and try again.");
        }
        throw error;
      }

      if (data?.user) {
        // Wait for session to be established
        setTimeout(async () => {
          await handleRoleBasedRedirect(data.user.id);
        }, 1000);
      }
      
      return data;
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
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
