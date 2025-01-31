import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Auth = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
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
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
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

  const resetForm = () => {
    setFormData({
      email: "",
      password: ""
    });
  };

  const AuthForm = () => (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
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
          onChange={handleInputChange}
          required
          minLength={6}
          disabled={loading}
          autoComplete="current-password"
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
                      resetForm();
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
                  resetForm();
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