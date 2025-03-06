
import { VehicleForm } from "./components/VehicleForm";
import { useQuoteFormContext } from "../providers/QuoteFormProvider";
import { VehicleSelector } from "./components/VehicleSelector";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useClientVehicles } from "./hooks/useClientVehicles";

export function VehicleInfoStep() {
  const { formData, updateFormData } = useQuoteFormContext();
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);
  const { vehicles, isLoading } = useClientVehicles();
  
  const handleVehicleSelect = (vehicle: any) => {
    updateFormData({
      vehicleInfo: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin || "",
        color: vehicle.color || "",
        saveToAccount: false, // Add this property
      },
    });
  };
  
  const handleVehicleFormSubmit = (vehicleData: any) => {
    updateFormData({
      vehicleInfo: {
        ...vehicleData,
        saveToAccount: vehicleData.saveToAccount || false,
      },
    });
    setShowNewVehicleForm(false);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Vehicle Information</h2>
        <p className="text-muted-foreground">
          Please provide details about your vehicle
        </p>
      </div>
      
      <Separator />
      
      {showNewVehicleForm ? (
        <VehicleForm onSubmit={handleVehicleFormSubmit} />
      ) : (
        <div className="space-y-6">
          {!isLoading && vehicles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Select from your vehicles</h3>
              <VehicleSelector
                vehicles={vehicles}
                onSelect={handleVehicleSelect}
                selectedVehicleInfo={formData.vehicleInfo}
              />
            </div>
          )}

          <div className="flex flex-col items-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewVehicleForm(true)}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {vehicles.length > 0 ? "Add a different vehicle" : "Add vehicle information"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
