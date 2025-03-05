
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ServiceItemType } from "@/types/service-item";

interface PackageSelectProps {
  onSelect: (packageServices: ServiceItemType[]) => void;
  onCancel: () => void;
}

export function PackageSelect({ onSelect, onCancel }: PackageSelectProps) {
  const { data: packages, isLoading } = useQuery({
    queryKey: ["servicePackages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_packages")
        .select(`
          id,
          name,
          description,
          price,
          sale_price,
          status,
          service_package_items:service_package_items (
            id,
            service_id,
            service_type:service_types (
              id, 
              name,
              price,
              description
            ),
            quantity,
            price
          )
        `)
        .eq("status", "active");
        
      if (error) throw error;
      return data || [];
    }
  });

  const handleSelectPackage = (pkg: any) => {
    if (!pkg.service_package_items || pkg.service_package_items.length === 0) {
      return;
    }
    
    // Map package items to service items
    const services = pkg.service_package_items.map((item: any) => {
      const serviceType = item.service_type;
      return {
        service_id: serviceType.id,
        service_name: serviceType.name,
        description: serviceType.description || "",
        quantity: item.quantity || 1,
        unit_price: item.price || serviceType.price || 0,
        commission_rate: 0,
        commission_type: "percentage",
        assigned_profile_id: null,
        assigned_profiles: [],
      } as ServiceItemType;
    });
    
    onSelect(services);
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select a Service Package</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4 -mr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {packages && packages.length > 0 ? (
                packages.map((pkg: any) => (
                  <Card key={pkg.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {pkg.service_package_items?.length || 0} services included
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div>
                        <p className="font-medium">${pkg.price.toFixed(2)}</p>
                        {pkg.sale_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            ${pkg.sale_price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <Button onClick={() => handleSelectPackage(pkg)}>Select</Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No service packages available
                </p>
              )}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
