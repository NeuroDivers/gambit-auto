import { Tables } from "@/integrations/supabase/types"

type InvoiceBusinessInfoProps = {
  businessProfile: Tables<'business_profile'> | null
  logo_url?: string | null
}

export function InvoiceBusinessInfo({ businessProfile, logo_url }: InvoiceBusinessInfoProps) {
  if (!businessProfile) return null

  return (
    <div className="flex items-start gap-4 w-full md:w-auto">
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
      <div className="space-y-1 flex-grow md:flex-grow-0">
        <h1 className="text-xl font-bold text-purple-600">{businessProfile.company_name}</h1>
        <p className="text-sm text-gray-600 whitespace-pre-wrap max-w-[300px]">{businessProfile.address}</p>
        <p className="text-sm text-gray-600">{businessProfile.phone_number}</p>
        <p className="text-sm text-gray-600 break-words">{businessProfile.email}</p>
      </div>
    </div>
  )
}