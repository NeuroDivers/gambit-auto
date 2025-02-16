
import { EmailVerification } from "./EmailVerification"
import { InvoicePrintPreview } from "./InvoicePrintPreview"
import { PrintButton } from "./PrintButton"
import { PaymentSection } from "./PaymentSection"
import { Invoice } from "../types"
import { Tables } from "@/integrations/supabase/types"

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
  if (!isAdmin && !isVerified) {
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
      {(isVerified || isAdmin) && invoice && (
        <PaymentSection invoice={invoice} />
      )}
    </div>
  )
}
