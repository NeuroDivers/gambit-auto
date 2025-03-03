
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from "@/components/customers/types";
import { VehicleCard } from "./VehicleCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
// We would typically add VehicleFormDialog here for adding new vehicles

interface VehicleListProps {
  customerId: string;
  vehicles?: Vehicle[];
}

export function VehicleList({ customerId, vehicles: initialVehicles }: VehicleListProps) {
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  
  // Only fetch vehicles if they weren't passed as props
  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ["customer_vehicles", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", customerId);

      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !initialVehicles,
    initialData: initialVehicles,
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading vehicles...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        Error loading vehicles. Please try again.
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">No vehicles found for this customer.</p>
        <Button 
          variant="outline" 
          onClick={() => setShowAddVehicle(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
        {/* We would add VehicleFormDialog component here */}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Vehicles</h3>
        <Button 
          variant="outline" 
          onClick={() => setShowAddVehicle(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
      
      {/* We would add VehicleFormDialog component here */}
    </div>
  );
}
