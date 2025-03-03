
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Customer } from "@/components/customers/types"
import { FileText, Mail, Phone } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface CustomerHeaderProps {
  customer: Customer
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  const handleSendMagicLink = async () => {
    if (!customer?.email) return

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: customer.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      toast.success("Magic link sent successfully!", {
        description: "Check email for login instructions."
      })
    } catch (error: any) {
      console.error("Error sending magic link:", error)
      toast.error("Failed to send magic link", {
        description: error.message
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={`https://avatar.vercel.sh/${customer.email}.png`} />
              <AvatarFallback className="text-2xl">
                {customer.first_name[0]}{customer.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {customer.first_name} {customer.last_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {customer.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {customer.phone_number || 'No phone number'}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                {customer.address || 'No address'}
              </div>
            </div>
          </div>
          <Button
            onClick={handleSendMagicLink}
            variant="outline"
            className="ml-auto"
          >
            Send Magic Link
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}
