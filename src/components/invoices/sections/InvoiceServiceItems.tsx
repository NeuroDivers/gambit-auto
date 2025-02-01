import { InvoiceItem } from '../types'
import { formatCurrency } from '@/lib/utils'

type InvoiceServiceItemsProps = {
  items: InvoiceItem[]
  setItems?: (items: InvoiceItem[]) => void
}

export function InvoiceServiceItems({ items = [] }: InvoiceServiceItemsProps) {
  if (!items || items.length === 0) {
    return (
      <div className="pt-4">
        <h2 className="font-semibold mb-4 text-[#1A1F2C]">Services / Services</h2>
        <p className="text-[#8E9196]">No services added</p>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F1F0FB]">
            <th className="py-2 text-left text-[#8E9196] font-medium">Service / Service</th>
            <th className="py-2 text-left text-[#8E9196] font-medium">Description / Description</th>
            <th className="py-2 text-right text-[#8E9196] font-medium">Quantité / Quantity</th>
            <th className="py-2 text-right text-[#8E9196] font-medium">Prix unitaire / Unit Price</th>
            <th className="py-2 text-right text-[#8E9196] font-medium">Montant / Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-[#F1F0FB]">
              <td className="py-3 text-[#1A1F2C]">{item.service_name}</td>
              <td className="py-3 text-[#1A1F2C]">{item.description}</td>
              <td className="py-3 text-right text-[#1A1F2C]">{item.quantity}</td>
              <td className="py-3 text-right text-[#1A1F2C]">{formatCurrency(item.unit_price)}</td>
              <td className="py-3 text-right text-[#1A1F2C]">{formatCurrency(item.quantity * item.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}