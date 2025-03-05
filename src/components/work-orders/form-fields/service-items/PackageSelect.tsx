
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ServiceItemType } from "@/types/index";

interface PackageSelectProps {
  packages: any[];
  onPackageSelect: (selectedServices: ServiceItemType[]) => void;
  selectedPackage?: string;
}

export function PackageSelect({ packages, onPackageSelect, selectedPackage }: PackageSelectProps) {
  const [expandedPackage, setExpandedPackage] = useState<string | null>(selectedPackage || null);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(selectedPackage || null);

  useEffect(() => {
    if (selectedPackage) {
      setExpandedPackage(selectedPackage);
      setSelectedPackageId(selectedPackage);
    }
  }, [selectedPackage]);

  const handlePackageSelect = (packageId: string) => {
    if (selectedPackageId === packageId) {
      // Deselect the package
      setSelectedPackageId(null);
      setSelectedItems({});
      setQuantities({});
      onPackageSelect([]);
    } else {
      // Select the package and all its services by default
      setSelectedPackageId(packageId);
      const selectedPkg = packages.find(pkg => pkg.id === packageId);
      
      if (selectedPkg && selectedPkg.services) {
        const newSelectedItems: Record<string, boolean> = {};
        const newQuantities: Record<string, number> = {};
        
        selectedPkg.services.forEach((service: any) => {
          newSelectedItems[service.id] = true;
          newQuantities[service.id] = 1;
        });
        
        setSelectedItems(newSelectedItems);
        setQuantities(newQuantities);
        
        // Convert to ServiceItemType array and pass to parent
        const serviceItems = selectedPkg.services
          .filter((service: any) => newSelectedItems[service.id])
          .map((service: any) => ({
            service_id: service.id,
            service_name: service.name,
            description: service.description || "",
            quantity: newQuantities[service.id] || 1,
            unit_price: service.price || 0,
            commission_rate: service.commission_rate || 0,
            commission_type: service.commission_type as "percentage" | "flat" || "percentage",
            assigned_profile_id: null,
            assigned_profiles: [],
          }));
        
        onPackageSelect(serviceItems);
      }
    }
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [serviceId]: checked
    }));
    
    // Update selected services
    if (selectedPackageId) {
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackageId);
      
      if (selectedPkg && selectedPkg.services) {
        const newSelectedItems = {
          ...selectedItems,
          [serviceId]: checked
        };
        
        updateSelectedServices(selectedPkg, newSelectedItems, quantities);
      }
    }
  };

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [serviceId]: quantity
    }));
    
    // Update selected services
    if (selectedPackageId) {
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackageId);
      
      if (selectedPkg && selectedPkg.services) {
        const newQuantities = {
          ...quantities,
          [serviceId]: quantity
        };
        
        updateSelectedServices(selectedPkg, selectedItems, newQuantities);
      }
    }
  };

  const updateSelectedServices = (
    selectedPkg: any, 
    selectedItemsState: Record<string, boolean>,
    quantitiesState: Record<string, number>
  ) => {
    const serviceItems = selectedPkg.services
      .filter((service: any) => selectedItemsState[service.id])
      .map((service: any) => ({
        service_id: service.id,
        service_name: service.name,
        description: service.description || "",
        quantity: quantitiesState[service.id] || 1,
        unit_price: service.price || 0,
        commission_rate: service.commission_rate || 0,
        commission_type: (service.commission_type as "percentage" | "flat") || "percentage",
        assigned_profile_id: null,
        assigned_profiles: [],
      }));
    
    onPackageSelect(serviceItems);
  };

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No service packages available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <RadioGroup value={selectedPackageId || undefined} onValueChange={handlePackageSelect}>
          {packages.map(pkg => (
            <div key={pkg.id} className="flex items-start space-x-3 p-3 rounded-md border">
              <RadioGroupItem value={pkg.id} id={`package-${pkg.id}`} />
              <div className="grid gap-1.5 leading-none w-full">
                <div className="flex justify-between w-full">
                  <Label htmlFor={`package-${pkg.id}`}>{pkg.name}</Label>
                  <span className="text-sm font-medium">
                    ${pkg.price ? pkg.price.toFixed(2) : "0.00"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
                
                {selectedPackageId === pkg.id && pkg.services && pkg.services.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs mb-2 font-medium">Included Services:</p>
                    <div className="space-y-2">
                      {pkg.services.map((service: any) => (
                        <div key={service.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`service-${service.id}`}
                              checked={selectedItems[service.id] || false}
                              onCheckedChange={(checked) => 
                                handleServiceToggle(service.id, checked === true)
                              }
                            />
                            <Label 
                              htmlFor={`service-${service.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {service.name}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="1"
                              value={quantities[service.id] || 1}
                              onChange={(e) => 
                                handleQuantityChange(service.id, parseInt(e.target.value) || 1)
                              }
                              className="w-16 h-8 text-sm"
                              disabled={!selectedItems[service.id]}
                            />
                            <span className="text-sm w-20 text-right">
                              ${service.price ? service.price.toFixed(2) : "0.00"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
