import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"
import { toast } from "sonner"

type EmailVerificationProps = {
  correctEmail: string | null
  onVerified: () => void
}

export function EmailVerification({ correctEmail, onVerified }: EmailVerificationProps) {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (email.toLowerCase() === correctEmail?.toLowerCase()) {
      toast.success("Email verified successfully")
      onVerified()
    } else {
      toast.error("Invalid email address")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-center">Verify Invoice Access</h2>
        <p className="text-sm text-muted-foreground text-center">
          Please enter the email address associated with this invoice to view it
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <Button type="submit" className="w-full gap-2">
            <Mail className="h-4 w-4" />
            Verify Email
          </Button>
        </form>
      </div>
    </div>
  )
}