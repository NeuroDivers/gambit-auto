
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  color?: string;
  license_plate?: string;
  is_primary?: boolean;
}

export interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicleInfo: {
    make: string;
    model: string;
    year: number;
    vin?: string;
    color?: string;
    saveToAccount?: boolean;
  };
  onSelect: (vehicle: Vehicle) => void;
  onNewVehicle: () => void;
}

export function VehicleSelector({ 
  vehicles, 
  selectedVehicleInfo,
  onSelect,
  onNewVehicle
}: VehicleSelectorProps) {
  // Find if a vehicle matches the current selection
  const findSelectedVehicleId = () => {
    if (!selectedVehicleInfo?.make) return '';
    
    const selectedVehicle = vehicles.find(v => 
      v.make === selectedVehicleInfo.make && 
      v.model === selectedVehicleInfo.model && 
      v.year === Number(selectedVehicleInfo.year)
    );
    
    return selectedVehicle?.id || '';
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={findSelectedVehicleId()} onValueChange={(value) => {
        const vehicle = vehicles.find(v => v.id === value);
        if (vehicle) onSelect(vehicle);
      }}>
        <div className="grid grid-cols-1 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center space-x-2">
              <RadioGroupItem value={vehicle.id} id={vehicle.id} />
              <Label htmlFor={vehicle.id} className="flex-1 cursor-pointer">
                <Card className="cursor-pointer">
                  <CardContent className="pt-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                      {vehicle.color && <p className="text-sm text-muted-foreground">Color: {vehicle.color}</p>}
                      {vehicle.vin && <p className="text-sm text-muted-foreground">VIN: {vehicle.vin}</p>}
                      {vehicle.is_primary && <p className="text-xs text-primary">Primary Vehicle</p>}
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={onNewVehicle}
            type="button"
            className="mt-2 w-full flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add a New Vehicle
          </Button>
        </div>
      </RadioGroup>
    </div>
  );
}
