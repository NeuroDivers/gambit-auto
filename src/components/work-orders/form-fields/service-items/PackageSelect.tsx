import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceItemType } from "@/types/service-item";

interface Package {
  id: string;
  name: string;
  description: string;
  services: ServiceItemType[];
}

interface PackageSelectProps {
  onSelect: (services: ServiceItemType[]) => void;
  onCancel: () => void;
}

export function PackageSelect({ onSelect, onCancel }: PackageSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const { data: packages, isLoading, error } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*");

      if (error) {
        throw error;
      }

      return data as Package[];
    },
  });

  if (isLoading) {
    return <div>Loading packages...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handlePackageSelect = (packageId: string) => {
    const selected = packages?.find((pkg) => pkg.id === packageId) || null;
    setSelectedPackage(selected);
  };

  const handleConfirm = () => {
    if (selectedPackage) {
      onSelect(selectedPackage.services);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Select Package
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a Package</DialogTitle>
          <DialogDescription>
            Choose a pre-defined package of services.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField
            control={{}}
            name="package"
            render={() => (
              <FormItem>
                <FormLabel>Package</FormLabel>
                <Select onValueChange={handlePackageSelect}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <ScrollArea className="h-72 w-full">
                      {packages?.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select a package from the list.
                </FormDescription>
              </FormItem>
            )}
          />
          {selectedPackage && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedPackage.name}</CardTitle>
                <CardDescription>{selectedPackage.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul>
                  {selectedPackage.services.map((service) => (
                    <li key={service.service_id}>{service.service_name}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={handleConfirm}>Confirm Package</Button>
              </CardFooter>
            </Card>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
