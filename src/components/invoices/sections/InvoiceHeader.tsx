import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type InvoiceHeaderProps = {
  invoiceNumber: string;
  createdAt: string;
  dueDate: string | null;
}

export function InvoiceHeader({ invoiceNumber, createdAt, dueDate }: InvoiceHeaderProps) {
  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          {businessProfile?.logo_url && (
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
            <h1 className="text-xl font-bold text-[#1A1F2C]">{businessProfile?.company_name}</h1>
            <p className="text-sm text-[#8E9196]">{businessProfile?.address}</p>
            <p className="text-sm text-[#8E9196]">{businessProfile?.phone_number}</p>
            <p className="text-sm text-[#8E9196]">{businessProfile?.email}</p>
          </div>
        </div>
      </div>
      <div className="text-right space-y-2">
        <h2 className="text-2xl font-bold text-[#9b87f5]">FACTURE / INVOICE</h2>
        <div className="text-sm text-[#8E9196] space-y-1">
          <p>No. de facture / Invoice #: {invoiceNumber}</p>
          <p>Date d'émission / Issue Date: {formatDate(createdAt)}</p>
          {dueDate && (
            <p>Date d'échéance / Due Date: {formatDate(dueDate)}</p>
          )}
        </div>
      </div>
    </div>
  );
}