
import { Invoice } from '../../types'
import { Tables } from '@/integrations/supabase/types'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { InvoiceBusinessInfo } from './InvoiceBusinessInfo'
import { InvoiceHeader } from './InvoiceHeader'
import { InvoiceTaxInfo } from './InvoiceTaxInfo'

type InvoicePrintPreviewProps = {
  invoice: Invoice | null
  businessProfile: Tables<'business_profile'> | null
}

export function InvoicePrintPreview({ invoice, businessProfile }: InvoicePrintPreviewProps) {
  const { data: taxes } = useQuery({
    queryKey: ["business-taxes"],
    queryFn: async () => {
      if (!businessProfile?.id) return []
      
      const { data, error } = await supabase
        .from("business_taxes")
        .select("*")
        .eq("business_id", businessProfile.id)

      if (error) throw error
      return data
    },
    enabled: !!businessProfile?.id,
  })

  if (!invoice || !businessProfile) {
    return <div>No invoice data available</div>
  }

  // Calculate subtotal
  const subtotal = invoice.invoice_items?.reduce((acc, item) => {
    return acc + (item.quantity * item.unit_price)
  }, 0) ?? 0

  return (
    <div className="w-full bg-white p-4 md:p-8 rounded-lg shadow-sm space-y-6 md:space-y-8 print:shadow-none print:p-0">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only, .print-only * {
              visibility: visible;
            }
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
      <div className="print-only">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <InvoiceBusinessInfo businessProfile={businessProfile} />
          <InvoiceHeader invoice={invoice} />
        </div>

        <div className="space-y-1 mt-6">
          <h2 className="font-semibold">Facturer à / Bill To:</h2>
          <p className="text-purple-600">{invoice.customer_first_name} {invoice.customer_last_name}</p>
          <p className="text-gray-600">{invoice.customer_email}</p>
          {invoice.customer_phone && <p className="text-gray-600">{invoice.customer_phone}</p>}
          {invoice.customer_address && <p className="text-gray-600">{invoice.customer_address}</p>}
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0 mt-6">
          <div className="min-w-[600px] md:w-full p-4 md:p-0">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-purple-600 py-2">Service</th>
                  <th className="text-left text-purple-600 py-2">Description</th>
                  <th className="text-right text-purple-600 py-2">Quantité</th>
                  <th className="text-right text-purple-600 py-2">Prix unitaire</th>
                  <th className="text-right text-purple-600 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoice_items?.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 text-black">{item.service_name}</td>
                    <td className="py-2 text-black">{item.description}</td>
                    <td className="text-right py-2 text-black">{item.quantity}</td>
                    <td className="text-right py-2 text-black">${item.unit_price.toFixed(2)}</td>
                    <td className="text-right py-2 text-black">${(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <InvoiceTaxInfo taxes={taxes} subtotal={subtotal} />
        </div>

        {invoice.status === 'draft' && (
          <div className="bg-blue-50 p-4 rounded-lg mt-6">
            <h3 className="font-bold text-blue-800">BROUILLON / DRAFT</h3>
            <p className="text-sm text-blue-600">
              Ceci est une facture brouillon - non valide pour paiement
              <br />
              This is a draft invoice - not valid for payment
            </p>
          </div>
        )}

        <div className="text-center text-sm text-gray-600 space-y-2 mt-6">
          <p>Merci d'avoir choisi {businessProfile.company_name}</p>
          <p>Thank you for choosing {businessProfile.company_name}</p>
          <p className="break-words">
            Pour toute question concernant cette facture, veuillez nous contacter à {businessProfile.email}
            <br />
            For questions about this invoice, please contact us at {businessProfile.email}
          </p>
        </div>
      </div>
    </div>
  )
}
