
import { useAuthForm } from "@/hooks/useAuthForm"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { AuthContent } from "@/components/auth/AuthContent"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

export default function Auth() {
  const navigate = useNavigate()

  // Query to check authentication status
  const { isLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // If user is authenticated, redirect to dashboard
        console.log('User is already authenticated, redirecting to dashboard')
        navigate('/dashboard', { replace: true })
      }
      return session
    }
  })

  const {
    isLogin,
    isModalOpen,
    setIsModalOpen,
    formData,
    loading,
    handleSubmit,
    handleChange,
    handleSignInClick,
    handleSignUpClick,
    handleGoogleSignIn,
    handleForgotPassword,
  } = useAuthForm()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <AuthLayout 
      title={isLogin ? "Welcome Back" : "Create Account"}
      subtitle={isLogin ? "Sign in to access your account" : "Sign up to get started"}
      footerText={isLogin ? "Don't have an account?" : "Already have an account?"}
      footerAction={{
        text: isLogin ? "Sign up" : "Sign in",
        href: "#",
        onClick: isLogin ? handleSignUpClick : handleSignInClick
      }}
    >
      <AuthContent
        isLogin={isLogin}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        formData={formData}
        loading={loading}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onSignInClick={handleSignInClick}
        onGoogleSignIn={handleGoogleSignIn}
        onForgotPassword={handleForgotPassword}
      />
    </AuthLayout>
  )
}
