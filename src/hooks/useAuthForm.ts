
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";

export interface AuthFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const useAuthForm = () => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

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
            first_name: formData.firstName,
            last_name: formData.lastName,
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
        console.log("User signed up successfully");
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully. Please check your email for verification.",
        });
        
        navigate("/client", { replace: true });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
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
        // Check if user has a profile (internal staff)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            role:role_id (
              name,
              nicename
            )
          `)
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking user role:', profileError);
          throw profileError;
        }

        // If user has a profile, they're internal staff, otherwise they're a client
        if (profileData?.role) {
          console.log("Internal staff logged in, redirecting to admin");
          navigate("/admin", { replace: true });
        } else {
          console.log("Client logged in, redirecting to client dashboard");
          navigate("/client", { replace: true });
        }

        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
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
      firstName: "",
      lastName: ""
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
