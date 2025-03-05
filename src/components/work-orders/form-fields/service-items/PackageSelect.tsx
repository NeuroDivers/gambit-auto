import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PackageSelectProps } from "@/types/service-item";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceItemType } from '@/types/service-item';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useForm, FormProvider } from "react-hook-form";

export function PackageSelect({ onSelect, onCancel }: PackageSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ServiceItemType[]>([]);

  const { data: packages, isLoading, error } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  });

  useEffect(() => {
    if (open) {
      setSelectedServices([]); // Reset selection when dialog opens
    }
  }, [open]);

  const handleSelectPackage = async (packageId: string) => {
    const { data: packageServices, error } = await supabase
      .from('package_services')
      .select('service_id, service_name, quantity, unit_price')
      .eq('package_id', packageId);

    if (error) {
      console.error("Error fetching package services:", error);
      return;
    }

    const mappedServices = packageServices.map(ps => ({
      service_id: ps.service_id,
      service_name: ps.service_name,
      quantity: ps.quantity,
      unit_price: ps.unit_price,
      commission_rate: 0,
      commission_type: null,
      description: ''
    } as ServiceItemType));

    setSelectedServices(mappedServices);
  };

  const handleConfirm = () => {
    if (onSelect) {
      onSelect(selectedServices);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setOpen(false);
  };

  const methods = useForm();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Select Package</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a Package</DialogTitle>
          <DialogDescription>
            Choose a pre-defined package of services.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p>Loading packages...</p>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : (
          <FormProvider {...methods}>
            <form>
              <div className="grid gap-4 py-4">
                {packages && packages.map(pkg => (
                  <div key={pkg.id} className="border rounded-md p-2">
                    <Label htmlFor={`package-${pkg.id}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`package-${pkg.id}`}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSelectPackage(pkg.id);
                          } else {
                            setSelectedServices([]);
                          }
                        }}
                      />
                      <span>{pkg.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </form>
          </FormProvider>
        )}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
