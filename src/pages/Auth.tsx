import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpDialog } from "@/components/auth/SignUpDialog";

const Auth = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          navigate("/");
        }
      } catch (error: any) {
        console.error("Session check error:", error.message);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate("/");
        } else if (event === 'SIGNED_OUT') {
          navigate("/auth");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
          },
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
      password: "",
    });
  };

  const handleSignInClick = () => {
    setIsLogin(true);
    resetForm();
    setIsModalOpen(false);
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
              onSubmit={handleAuth}
              onChange={handleInputChange}
            />
            <div className="text-center">
              <SignUpDialog
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                formData={formData}
                loading={loading}
                onSubmit={handleAuth}
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
              onSubmit={handleAuth}
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