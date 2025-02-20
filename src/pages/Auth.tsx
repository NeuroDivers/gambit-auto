
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthContent } from "@/components/auth/AuthContent";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useAuthForm } from "@/hooks/useAuthForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formData, loading, handleInputChange, handleSignIn, handleSignUp, handleGoogleSignIn, resetForm } = useAuthForm();
  
  // Set up auth redirect - this will handle redirecting authenticated users
  useAuthRedirect();

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
      toast.error("Please enter your email address");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset password email");
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

  return (
    <AuthLayout 
      title={isLogin ? "Welcome Back" : "Create Account"} 
      subtitle={isLogin ? "Sign in to access your account" : "Sign up to get started"}
      footerText={isLogin ? "Don't have an account?" : "Already have an account?"}
      footerAction={{
        text: isLogin ? "Sign up" : "Sign in",
        href: "#",
        onClick: isLogin ? handleSignUpClick : handleSignInClick
      }}
    >
      <AuthContent
        isLogin={isLogin}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        formData={formData}
        loading={loading}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
        onSignInClick={handleSignInClick}
        onGoogleSignIn={handleGoogleSignIn}
        onForgotPassword={handleForgotPassword}
      />
    </AuthLayout>
  );
};

export default Auth;
