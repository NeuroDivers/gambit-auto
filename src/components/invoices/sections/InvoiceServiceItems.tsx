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
        <h2 className="font-semibold mb-4 text-white">Services / Services</h2>
        <p className="text-gray-300">No services added</p>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F1F0FB]">
            <th className="py-2 text-left text-gray-300 font-medium">Service / Service</th>
            <th className="py-2 text-left text-gray-300 font-medium">Description / Description</th>
            <th className="py-2 text-right text-gray-300 font-medium">Quantité / Quantity</th>
            <th className="py-2 text-right text-gray-300 font-medium">Prix unitaire / Unit Price</th>
            <th className="py-2 text-right text-gray-300 font-medium">Montant / Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-[#F1F0FB]">
              <td className="py-3 text-white">{item.service_name}</td>
              <td className="py-3 text-white">{item.description}</td>
              <td className="py-3 text-right text-white">{item.quantity}</td>
              <td className="py-3 text-right text-white">{formatCurrency(item.unit_price)}</td>
              <td className="py-3 text-right text-white">{formatCurrency(item.quantity * item.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}