import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function InvoiceFooter() {
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
    <div className="text-center text-sm text-[#8E9196] space-y-2 mt-8 pt-8 border-t border-[#F1F0FB]">
      <p>Merci d'avoir choisi {businessProfile?.company_name}</p>
      <p>Thank you for choosing {businessProfile?.company_name}</p>
      <p>
        Pour toute question concernant cette facture, veuillez nous contacter à {businessProfile?.email}
        <br />
        For questions about this invoice, please contact us at {businessProfile?.email}
      </p>
    </div>
  );
}