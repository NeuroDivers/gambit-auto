import { UseFormReturn } from 'react-hook-form';
import { ServiceFormData } from '@/types/service-item';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface VehicleInfoStepProps {
  form: UseFormReturn<ServiceFormData>;
  onVehicleSave: (vehicleId: string) => void;
}

export function VehicleInfoStep({ form, onVehicleSave }: VehicleInfoStepProps) {
  const [clientVehicles, setClientVehicles] = useState<any[]>([]);
  const { user } = useAuth();
  
  // Fetch client vehicles if user is logged in
  const { data: vehicles = [] } = useQuery({
    queryKey: ['clientVehicles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <div className="space-y-4">
            {vehicles.length > 0 && (
              <div className="mb-6">
                <FormLabel className="mb-2 block">Select an existing vehicle</FormLabel>
                <Select
                  onValueChange={(vehicleId) => {
                    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
                    if (selectedVehicle) {
                      form.setValue('vehicleInfo.make', selectedVehicle.make);
                      form.setValue('vehicleInfo.model', selectedVehicle.model);
                      form.setValue('vehicleInfo.year', selectedVehicle.year);
                      form.setValue('vehicleInfo.vin', selectedVehicle.vin || '');
                      form.setValue('vehicleInfo.color', selectedVehicle.color || '');
                      onVehicleSave(vehicleId);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.color ? `(${vehicle.color})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleInfo.make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Toyota" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleInfo.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Camry" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="vehicleInfo.year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleInfo.color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Silver" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vehicleInfo.vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIN (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Vehicle Identification Number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {user?.id && (
              <FormField
                control={form.control}
                name="vehicleInfo.saveToAccount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Save this vehicle to my account</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
