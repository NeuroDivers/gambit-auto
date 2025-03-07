
import { LoginForm } from "./LoginForm";
import { AuthFormData } from "@/hooks/useAuthForm";

interface AuthContentProps {
  isLogin: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  formData: AuthFormData;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignInClick: () => void;
  onGoogleSignIn: () => void;
  onForgotPassword: () => void;
}

export const AuthContent = ({
  isLogin,
  formData,
  loading,
  onSubmit,
  onChange,
  onGoogleSignIn,
  onForgotPassword,
}: AuthContentProps) => {
  return (
    <LoginForm
      formData={formData}
      loading={loading}
      onSubmit={onSubmit}
      onChange={onChange}
      onGoogleSignIn={onGoogleSignIn}
      onForgotPassword={onForgotPassword}
      isLogin={isLogin}
    />
  );
};
