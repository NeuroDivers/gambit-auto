
import React, { useState, useEffect, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';
import { CommissionFields } from './CommissionFields';
import { useServiceTypes } from '@/hooks/useServiceTypes';

interface ServiceItem {
  id: string;
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  description: string;
  commission_rate?: number | null;
  commission_type?: 'percentage' | 'fixed' | null;
  package_id?: string | null;
}

interface ServiceSelectionFieldProps {
  services: {
    service_id: string;
    service_name: string;
    quantity: number;
    unit_price: number;
    description: string;
    commission_rate?: number | null;
    commission_type?: 'percentage' | 'fixed' | null;
    package_id?: string | null;
  }[];
  onChange: (items: any[]) => void;
  allowPriceEdit?: boolean;
  showCommission?: boolean;
}

export function ServiceSelectionField({ 
  services, 
  onChange, 
  allowPriceEdit = true, 
  showCommission = false 
}: ServiceSelectionFieldProps) {
  const { fields, append, remove, update } = useFieldArray({
    name: "services",
  });
  const { setValue, getValues } = useFormContext();
  const [initialized, setInitialized] = useState(false);
  const { data: availableServices } = useServiceTypes();

  // Initialize the form with the initial services prop
  useEffect(() => {
    if (!initialized) {
      // Check if services is not undefined and has a length greater than 0
      if (services && services.length > 0) {
        // Map each service to a new object that includes a unique id
        const initialServices = services.map(service => ({
          id: uuidv4(), // Generate a unique id for each service
          ...service,    // Spread the properties of the original service
        }));
  
        // Update the form values with the new array of services
        setValue("services", initialServices);
      } else {
        // If services is empty or undefined, set the form value to an empty array
        setValue("services", []);
      }
      setInitialized(true);
    }
  }, [services, setValue, initialized]);

  // Sync the form values with the parent component's state
  useEffect(() => {
    if (initialized) {
      const currentValues = getValues("services") as ServiceItem[];
      onChange(currentValues.map(item => ({
        service_id: item.service_id,
        service_name: item.service_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        description: item.description || "",
        commission_rate: item.commission_rate,
        commission_type: item.commission_type,
        package_id: item.package_id
      })));
    }
  }, [fields, onChange, getValues, initialized]);

  const handleAddService = useCallback(() => {
    append({
      id: uuidv4(),
      service_id: "",
      service_name: "",
      quantity: 1,
      unit_price: 0,
      description: "",
      commission_rate: 0,
      commission_type: null,
      package_id: null
    });
  }, [append]);

  const handleServiceChange = useCallback((index: number, serviceId: string) => {
    if (!availableServices) return;

    const selectedService = availableServices.find((service) => service.id === serviceId);

    if (selectedService) {
      const currentField = fields[index] as ServiceItem;
      update(index, {
        ...currentField,
        service_id: selectedService.id,
        service_name: selectedService.name,
        unit_price: selectedService.price || 0,
        description: selectedService.description || "",
      });
    }
  }, [availableServices, fields, update]);

  const handleQuantityChange = useCallback((index: number, quantity: number) => {
    const currentField = fields[index] as ServiceItem;
    update(index, {
      ...currentField,
      quantity: quantity,
    });
  }, [fields, update]);

  const handlePriceChange = useCallback((index: number, price: number) => {
    const currentField = fields[index] as ServiceItem;
    update(index, {
      ...currentField,
      unit_price: price,
    });
  }, [fields, update]);

  const handleDescriptionChange = useCallback((index: number, description: string) => {
    const currentField = fields[index] as ServiceItem;
    update(index, {
      ...currentField,
      description: description,
    });
  }, [fields, update]);

  const handleCommissionChange = useCallback((index: number, commissionRate: number | null, commissionType: 'percentage' | 'fixed' | null) => {
    const currentField = fields[index] as ServiceItem;
    update(index, {
      ...currentField,
      commission_rate: commissionRate,
      commission_type: commissionType,
    });
  }, [fields, update]);

  const calculateTotal = () => {
    if (!fields || fields.length === 0) {
      return 0;
    }

    return fields.reduce((total, item) => {
      const serviceItem = item as ServiceItem;
      const quantity = serviceItem.quantity || 0;
      const unitPrice = serviceItem.unit_price || 0;
      return total + (quantity * unitPrice);
    }, 0);
  };

  const calculateTotalCommission = () => {
    if (!fields || fields.length === 0) {
      return 0;
    }
  
    return fields.reduce((totalCommission, item) => {
      const serviceItem = item as ServiceItem;
      if (serviceItem.commission_type === 'percentage') {
        // Ensure commission_rate is not undefined and is treated as 0 if it is
        const commissionRate = serviceItem.commission_rate || 0;
        // Calculate commission based on percentage
        const totalItemPrice = (serviceItem.quantity || 0) * (serviceItem.unit_price || 0);
        const itemCommission = (commissionRate / 100) * totalItemPrice;
        return totalCommission + itemCommission;
      } else if (serviceItem.commission_type === 'fixed') {
        // If commission_type is fixed, add the commission_rate directly
        const commissionRate = serviceItem.commission_rate || 0;
        return totalCommission + commissionRate;
      } else {
        return totalCommission; // If no commission or commission_type is not percentage, add 0
      }
    }, 0);
  };

  return (
    <div className="w-full relative overflow-x-auto">
      <Table>
        <TableCaption>Select services for this invoice.</TableCaption>
        <TableHead>
          <TableRow>
            <TableHead className="w-[200px]">Service</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            {showCommission && (
              <TableHead>Commission</TableHead>
            )}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((item, index) => {
            const serviceItem = item as ServiceItem;
            return (
              <TableRow key={serviceItem.id}>
                <TableCell className="font-medium">
                  <Select 
                    value={serviceItem.service_id} 
                    onValueChange={(value) => handleServiceChange(index, value)}
                  >
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServices?.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Textarea 
                    value={serviceItem.description}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    placeholder="Service description"
                    className="resize-none border-none focus-visible:ring-0 shadow-none"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={serviceItem.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    className="w-24"
                    min={1}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={serviceItem.unit_price}
                    onChange={(e) => handlePriceChange(index, parseFloat(e.target.value))}
                    className="w-24"
                    disabled={!allowPriceEdit}
                  />
                </TableCell>
                {showCommission && (
                  <TableCell>
                    <CommissionFields 
                      commissionRate={serviceItem.commission_rate || 0}
                      commissionType={serviceItem.commission_type || null}
                      onCommissionChange={(rate, type) => handleCommissionChange(index, rate, type)}
                    />
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>
              <Button onClick={handleAddService}>Add Service</Button>
            </TableCell>
            <TableCell className="text-right font-bold">Total:</TableCell>
            <TableCell className="font-bold">${calculateTotal().toFixed(2)}</TableCell>
            {showCommission && (
              <>
                <TableCell className="text-right font-bold">Total Commission:</TableCell>
                <TableCell className="font-bold">${calculateTotalCommission().toFixed(2)}</TableCell>
              </>
            )}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
