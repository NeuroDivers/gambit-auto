import { Invoice } from '../types'
import { InvoiceHeader } from './InvoiceHeader'
import { CustomerInfo } from './CustomerInfo'
import { ServicesList } from './ServicesList'
import { InvoiceTotals } from './InvoiceTotals'
import { InvoiceFooter } from './InvoiceFooter'
import { Tables } from '@/integrations/supabase/types'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

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

  const gstTax = taxes?.find(tax => tax.tax_type === 'GST')
  const qstTax = taxes?.find(tax => tax.tax_type === 'QST')

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          {businessProfile.logo_url && (
            <img 
              src={businessProfile.logo_url} 
              alt="Business Logo" 
              className="h-16 w-16 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-purple-600">{businessProfile.company_name}</h1>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{businessProfile.address}</p>
            <p className="text-sm text-gray-600">{businessProfile.phone_number}</p>
            <p className="text-sm text-gray-600">{businessProfile.email}</p>
          </div>
        </div>
        <div className="text-right space-y-2">
          <h2 className="text-2xl font-bold text-purple-500">FACTURE / INVOICE</h2>
          {invoice.status && (
            <div className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 inline-block uppercase">
              {invoice.status}
            </div>
          )}
          <div className="text-sm text-gray-600 space-y-1">
            <p>No. de facture / Invoice #: {invoice.invoice_number}</p>
            <p>Date d'émission / Issue Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
            {invoice.due_date && (
              <p>Date d'échéance / Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="font-semibold">Facturer à / Bill To:</h2>
        <p className="text-purple-600">{invoice.customer_first_name} {invoice.customer_last_name}</p>
        <p className="text-gray-600">{invoice.customer_email}</p>
        {invoice.customer_phone && <p className="text-gray-600">{invoice.customer_phone}</p>}
        {invoice.customer_address && <p className="text-gray-600">{invoice.customer_address}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
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
            {invoice.invoice_items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="py-2">{item.service_name}</td>
                <td className="py-2">{item.description}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                <td className="text-right py-2">${(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total / Subtotal</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          {gstTax && (
            <div className="flex justify-between text-gray-600">
              <span>TPS/GST ({gstTax.tax_rate}%)</span>
              <span>${((invoice.subtotal * gstTax.tax_rate) / 100).toFixed(2)}</span>
            </div>
          )}
          {qstTax && (
            <div className="flex justify-between text-gray-600">
              <span>TVQ/QST ({qstTax.tax_rate}%)</span>
              <span>${((invoice.subtotal * qstTax.tax_rate) / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total / Total</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
          <div className="text-xs text-gray-500 space-y-1 pt-2">
            {gstTax && <p>TPS/GST No: {gstTax.tax_number}</p>}
            {qstTax && <p>TVQ/QST No: {qstTax.tax_number}</p>}
          </div>
        </div>
      </div>

      {invoice.status === 'draft' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-800">BROUILLON / DRAFT</h3>
          <p className="text-sm text-blue-600">
            Ceci est une facture brouillon - non valide pour paiement
            <br />
            This is a draft invoice - not valid for payment
          </p>
        </div>
      )}

      <div className="text-center text-sm text-gray-600 space-y-2">
        <p>Merci d'avoir choisi {businessProfile.company_name}</p>
        <p>Thank you for choosing {businessProfile.company_name}</p>
        <p>
          Pour toute question concernant cette facture, veuillez nous contacter à {businessProfile.email}
          <br />
          For questions about this invoice, please contact us at {businessProfile.email}
        </p>
      </div>
    </div>
  )
}