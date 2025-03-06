
import React, { useState } from 'react';
import { VehicleForm } from './components/VehicleForm';
import { VehicleSelector } from './components/VehicleSelector';
import { useClientVehicles } from './hooks/useClientVehicles';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormData } from '@/types/service-item';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VehicleInfoStepProps {
  form: UseFormReturn<ServiceFormData>;
  onVehicleSave?: (data: any) => void;
}

export function VehicleInfoStep({ form, onVehicleSave }: VehicleInfoStepProps) {
  const [activeTab, setActiveTab] = useState<string>('select');
  const { data: vehiclesData, isLoading } = useClientVehicles();
  
  const vehicles = vehiclesData?.vehicles || [];
  const hasVehicles = vehicles.length > 0;

  // If no vehicles are available, automatically show the form
  React.useEffect(() => {
    if (!isLoading && !hasVehicles) {
      setActiveTab('new');
    }
  }, [isLoading, hasVehicles]);

  const handleVehicleSelect = (vehicle: any) => {
    form.setValue('vehicleInfo.make', vehicle.make);
    form.setValue('vehicleInfo.model', vehicle.model);
    form.setValue('vehicleInfo.year', vehicle.year);
    form.setValue('vehicleInfo.vin', vehicle.vin || '');
    form.setValue('vehicleInfo.color', vehicle.color || '');
    form.setValue('vehicleInfo.saveToAccount', false);
    
    if (onVehicleSave) {
      onVehicleSave({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        color: vehicle.color
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue={hasVehicles ? 'select' : 'new'} value={activeTab} onValueChange={setActiveTab}>
            {hasVehicles && (
              <TabsList className="mb-4">
                <TabsTrigger value="select">Select a Vehicle</TabsTrigger>
                <TabsTrigger value="new">Add New Vehicle</TabsTrigger>
              </TabsList>
            )}

            {hasVehicles && (
              <TabsContent value="select">
                <VehicleSelector
                  vehicles={vehicles}
                  selectedVehicleInfo={{
                    make: form.watch('vehicleInfo.make'),
                    model: form.watch('vehicleInfo.model'),
                    year: form.watch('vehicleInfo.year'),
                    vin: form.watch('vehicleInfo.vin'),
                    color: form.watch('vehicleInfo.color'),
                    saveToAccount: form.watch('vehicleInfo.saveToAccount')
                  }}
                  onSelect={handleVehicleSelect}
                  onNewVehicle={() => setActiveTab('new')}
                />
              </TabsContent>
            )}

            <TabsContent value="new">
              <VehicleForm form={form} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
