import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  formData: {
    email: string;
    password: string;
  };
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginForm = ({ formData, loading, onSubmit, onChange }: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={onChange}
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={onChange}
          required
          minLength={6}
          disabled={loading}
          autoComplete="current-password"
        />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Loading..." : "Sign In"}
      </Button>
    </form>
  );
};