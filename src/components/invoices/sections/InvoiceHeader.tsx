import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          {businessProfile?.logo_url && (
            <img 
              src={businessProfile.logo_url} 
              alt="Business Logo" 
              className="h-16 w-16 object-contain"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{businessProfile?.company_name}</h1>
            <p className="text-sm text-muted-foreground">{businessProfile?.address}</p>
            <p className="text-sm text-muted-foreground">{businessProfile?.phone_number}</p>
            <p className="text-sm text-muted-foreground">{businessProfile?.email}</p>
          </div>
        </div>
      </div>
      <div className="text-right space-y-2">
        <h2 className="text-xl font-semibold text-primary">FACTURE / INVOICE</h2>
        <Badge variant="outline" className="ml-auto">PENDING</Badge>
        <div className="text-sm text-muted-foreground space-y-1">
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