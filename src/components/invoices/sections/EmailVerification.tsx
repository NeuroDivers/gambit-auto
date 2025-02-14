
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail } from "lucide-react"

type EmailVerificationProps = {
  correctEmail: string | null
  onVerified: () => void
}

export function EmailVerification({ correctEmail, onVerified }: EmailVerificationProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.toLowerCase() === correctEmail?.toLowerCase()) {
      onVerified()
    } else {
      setError("Email does not match our records")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Verify Your Email</h2>
          <p className="text-muted-foreground">
            Please enter your email address to view this invoice
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Verify Email
          </Button>
        </form>
      </Card>
    </div>
  )
}
