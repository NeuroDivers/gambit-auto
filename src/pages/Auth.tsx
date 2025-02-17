
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthContent } from "@/components/auth/AuthContent";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useAuthForm } from "@/hooks/useAuthForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formData, loading, handleInputChange, handleAuth, handleGoogleSignIn, resetForm } = useAuthForm();
  
  // Set up auth redirect
  useAuthRedirect();

  const handleSignInClick = () => {
    setIsLogin(true);
    resetForm();
    setIsModalOpen(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    handleAuth(e, isLogin);
  };

  return (
    <AuthLayout>
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
