import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface InvoiceEmailVerificationProps {
  invoiceId: string
  onVerified: () => void
}

export function InvoiceEmailVerification({ invoiceId, onVerified }: InvoiceEmailVerificationProps) {
  const [email, setEmail] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)

    try {
      const { data: invoice, error } = await supabase
        .from("invoices")
        .select(`
          customer_email,
          work_order:work_orders (
            email
          )
        `)
        .eq('id', invoiceId)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!invoice) {
        toast.error("Invoice not found")
        return
      }

      const workOrderEmail = invoice.work_order?.email
      const invoiceEmail = invoice.customer_email

      if (email === workOrderEmail || email === invoiceEmail) {
        onVerified()
        toast.success("Email verified successfully")
      } else {
        toast.error("Email verification failed. Please try again.")
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error("Failed to verify email")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 bg-card rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Email Verification</h2>
        <p className="text-sm text-muted-foreground">
          Please enter your email address to view the invoice
        </p>
      </div>
      <form onSubmit={handleVerification} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isVerifying}>
          {isVerifying ? "Verifying..." : "View Invoice"}
        </Button>
      </form>
    </div>
  )
}