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
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignInClick = () => {
    setIsLogin(true);
    resetForm();
  };

  const handleSignUpClick = () => {
    setIsLogin(false);
    resetForm();
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent! Please check your inbox.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset password email",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      try {
        const result = await handleSignIn(e);
        console.log("Sign in result:", result);
      } catch (error) {
        console.error("Sign in error:", error);
      }
    } else {
      try {
        const result = await handleSignUp(e);
        console.log("Sign up result:", result);
      } catch (error) {
        console.error("Sign up error:", error);
      }
    }
  };

  const handleRoleBasedRedirect = async (userId: string) => {
    try {
      console.log("Checking user role for redirect...");
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

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profileData?.role) {
        console.error("No role found for user");
        throw new Error("No role found for user");
      }

      console.log("Profile data for redirect:", profileData);

      // All users go to dashboard first
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error during role-based redirect:", error);
      // Default to dashboard if role check fails
      navigate("/dashboard", { replace: true });
    }
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
        // Wait a moment for the session to be fully established
        setTimeout(async () => {
          // Redirect based on role
          await handleRoleBasedRedirect(data.user.id);
        }, 1000);
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

        // Wait a moment for the session to be fully established
        setTimeout(async () => {
          // Redirect based on role
          await handleRoleBasedRedirect(signUpData.user.id);
        }, 1000);
        
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

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
    });
  };

  return {
    isLogin,
    isModalOpen,
    setIsModalOpen,
    formData,
    loading,
    handleSubmit,
    handleChange,
    handleSignInClick,
    handleSignUpClick,
    handleGoogleSignIn,
    handleForgotPassword,
    resetForm,
  };
};
