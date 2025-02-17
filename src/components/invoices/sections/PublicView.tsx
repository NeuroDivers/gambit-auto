
import { EmailVerification } from "./EmailVerification"
import { InvoicePrintPreview } from "./InvoicePrintPreview"
import { PrintButton } from "./PrintButton"
import { PaymentSection } from "./PaymentSection"
import { Invoice } from "../types"
import { Tables } from "@/integrations/supabase/types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type PublicViewProps = {
  invoice: Invoice | null
  businessProfile: Tables<'business_profile'> | null
  isVerified: boolean
  setIsVerified: (value: boolean) => void
  isAdmin: boolean
  onPrint: () => void
  printRef: React.RefObject<HTMLDivElement>
}

export function PublicView({ 
  invoice, 
  businessProfile, 
  isVerified, 
  setIsVerified, 
  isAdmin,
  onPrint,
  printRef 
}: PublicViewProps) {
  // Check if the current user is the owner of the invoice
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return null

      const { data: profile } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .single()

      return profile
    }
  })

  // If the user is logged in and the invoice belongs to them, or they're verified, or they're an admin, show the invoice
  const canViewInvoice = 
    isAdmin || 
    isVerified || 
    (currentUser && invoice && currentUser.email === invoice.customer_email)

  if (!canViewInvoice) {
    return (
      <EmailVerification 
        correctEmail={invoice?.customer_email || null}
        onVerified={() => setIsVerified(true)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {isAdmin ? null : (
        <div className="flex justify-end">
          <PrintButton onPrint={onPrint} />
        </div>
      )}
      <div ref={printRef}>
        <InvoicePrintPreview invoice={invoice} businessProfile={businessProfile} />
      </div>
      {(isVerified || isAdmin || currentUser) && invoice && (
        <PaymentSection invoice={invoice} />
      )}
    </div>
  )
}
