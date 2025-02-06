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
      <div className="bg-card p-8 rounded-lg border border-border shadow-lg space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Verify Invoice Access
          </h2>
          <p className="text-sm text-muted-foreground">
            Please enter the email address associated with this invoice to view it
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border-border"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Mail className="h-4 w-4" />
            Verify Email
          </Button>
        </form>
      </div>
    </div>
  )
}