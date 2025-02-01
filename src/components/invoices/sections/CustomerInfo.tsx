type CustomerInfoProps = {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
}

export function CustomerInfo({ 
  customerName, 
  customerEmail, 
  customerPhone, 
  customerAddress 
}: CustomerInfoProps) {
  return (
    <div>
      <h2 className="font-semibold mb-2 text-[#1A1F2C]">Facturer à / Bill To:</h2>
      <div className="space-y-1">
        <p className="text-[#1A1F2C]">{customerName}</p>
        <p className="text-[#8E9196]">{customerEmail}</p>
        <p className="text-[#8E9196]">{customerPhone}</p>
        <p className="text-[#8E9196]">{customerAddress}</p>
      </div>
    </div>
  )
}