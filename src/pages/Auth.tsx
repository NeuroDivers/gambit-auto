import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpDialog } from "@/components/auth/SignUpDialog";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useAuthForm } from "@/hooks/useAuthForm";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formData, loading, handleInputChange, handleAuth, resetForm } = useAuthForm();
  
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="text-center space-y-2">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>

        {isLogin ? (
          <>
            <LoginForm
              formData={formData}
              loading={loading}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
            />
            <div className="text-center">
              <SignUpDialog
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                formData={formData}
                loading={loading}
                onSubmit={handleSubmit}
                onChange={handleInputChange}
                onSignInClick={handleSignInClick}
              />
            </div>
          </>
        ) : (
          <>
            <LoginForm
              formData={formData}
              loading={loading}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
            />
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-primary hover:underline"
                onClick={handleSignInClick}
              >
                Already have an account? Sign in
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
