
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";

interface SignUpDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    email: string;
    password: string;
  };
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignInClick: () => void;
  onGoogleSignIn: () => void;
}

export const SignUpDialog = ({
  isOpen,
  onOpenChange,
  formData,
  loading,
  onSubmit,
  onChange,
  onSignInClick,
  onGoogleSignIn,
}: SignUpDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          className="text-primary hover:underline"
        >
          Don't have an account? Sign up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <LoginForm
            formData={formData}
            loading={loading}
            onSubmit={onSubmit}
            onChange={onChange}
            onGoogleSignIn={onGoogleSignIn}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
