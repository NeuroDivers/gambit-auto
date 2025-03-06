
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "@/types/service-item";

interface VehicleFormProps {
  form: UseFormReturn<ServiceFormData>;
}

export function VehicleForm({ form }: VehicleFormProps) {
  return (
    <div className="space-y-4">
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
              <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="vehicleInfo.year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 2022" {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value) || '')} />
              </FormControl>
              <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="vehicleInfo.color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Color (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Red" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="vehicleInfo.saveToAccount"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-4 w-4 rounded border-gray-300 text-primary"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Save to My Vehicles</FormLabel>
              <p className="text-sm text-muted-foreground">Save this vehicle to your account for future requests</p>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
