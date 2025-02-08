
import { SignUpDialog } from "./SignUpDialog";
import { LoginForm } from "./LoginForm";
import { Button } from "@/components/ui/button";
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
}

export const AuthContent = ({
  isLogin,
  isModalOpen,
  setIsModalOpen,
  formData,
  loading,
  onSubmit,
  onChange,
  onSignInClick,
}: AuthContentProps) => {
  return isLogin ? (
    <>
      <LoginForm
        formData={formData}
        loading={loading}
        onSubmit={onSubmit}
        onChange={onChange}
      />
      <div className="text-center">
        <SignUpDialog
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          formData={formData}
          loading={loading}
          onSubmit={onSubmit}
          onChange={onChange}
          onSignInClick={onSignInClick}
        />
      </div>
    </>
  ) : (
    <>
      <LoginForm
        formData={formData}
        loading={loading}
        onSubmit={onSubmit}
        onChange={onChange}
      />
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-primary hover:underline"
          onClick={onSignInClick}
        >
          Already have an account? Sign in
        </Button>
      </div>
    </>
  );
};
