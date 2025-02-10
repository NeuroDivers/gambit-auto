
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthContent } from "@/components/auth/AuthContent";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useAuthForm } from "@/hooks/useAuthForm";

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
      />
    </AuthLayout>
  );
};

export default Auth;
