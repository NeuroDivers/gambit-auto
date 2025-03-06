
import { useParams } from "react-router-dom"
import { InvoiceView } from "@/components/invoices/InvoiceView"
import { useState } from "react"

export default function PublicInvoiceView() {
  const { id } = useParams()
  const [isVerified, setIsVerified] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="max-w-[1000px] mx-auto">
          <InvoiceView 
            invoiceId={id} 
            isPublic={true}
          />
        </div>
      </div>
    </div>
  )
}
