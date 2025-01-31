import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message === "Invalid login credentials") {
            throw new Error(
              "Invalid email or password. Please check your credentials and try again."
            );
          }
          throw error;
        }
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          }
        });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
        setIsLogin(true);
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const AuthForm = () => (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
      </Button>
    </form>
  );

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
            <AuthForm />
            <div className="text-center">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setIsLogin(false);
                      setEmail("");
                      setPassword("");
                    }}
                  >
                    Don't have an account? Sign up
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <AuthForm />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        ) : (
          <>
            <AuthForm />
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-primary hover:underline"
                onClick={() => {
                  setIsLogin(true);
                  setEmail("");
                  setPassword("");
                  setIsModalOpen(false);
                }}
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