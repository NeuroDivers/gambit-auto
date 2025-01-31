import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeDialog } from "./ServiceTypeDialog";
import { ServiceTypesTable } from "./ServiceTypesTable";
import { useState } from "react";

export const ServiceTypesList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: serviceTypes, refetch } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white/[0.87]">Service Types</h2>
          <p className="text-white/60">Manage your service offerings</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#BB86FC] hover:bg-[#BB86FC]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service Type
        </Button>
      </div>
      
      <div className="rounded-lg border border-white/10 bg-[#1E1E1E]">
        <ServiceTypesTable serviceTypes={serviceTypes || []} onRefetch={refetch} />
      </div>

      <ServiceTypeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
};