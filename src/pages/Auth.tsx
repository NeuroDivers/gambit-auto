
import { useAuthForm } from "@/hooks/useAuthForm"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { AuthContent } from "@/components/auth/AuthContent"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"

export default function Auth() {
  // This hook will check auth state and redirect if needed
  useAuthRedirect()

  const {
    isLogin,
    isModalOpen,
    setIsModalOpen,
    formData,
    loading,
    handleSubmit,
    handleChange,
    handleSignInClick,
    handleGoogleSignIn,
    handleForgotPassword,
  } = useAuthForm()

  return (
    <AuthLayout>
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
