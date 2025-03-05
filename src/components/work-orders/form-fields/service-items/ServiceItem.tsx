
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash } from "lucide-react";
import { ServiceItemType } from "@/components/shared/form-fields/service-selection/types";

export interface ServiceItemProps {
  service: ServiceItemType;
  isEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onUpdate: (updatedService: ServiceItemType) => void;
  onCancelEdit: () => void;
  disabled: boolean;
  showCommission: boolean;
  showAssignedStaff: boolean;
}

export function ServiceItem({
  service,
  isEditing,
  onEdit,
  onRemove,
  onUpdate,
  onCancelEdit,
  disabled,
  showCommission,
  showAssignedStaff,
}: ServiceItemProps) {
  const [editedService, setEditedService] = useState<ServiceItemType>(service);

  const handleChange = (field: keyof ServiceItemType, value: any) => {
    setEditedService((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onUpdate(editedService);
  };

  if (isEditing) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Service</Label>
            <p className="text-base font-medium">{service.service_name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={editedService.quantity}
                onChange={(e) => handleChange("quantity", parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={editedService.unit_price}
                onChange={(e) => handleChange("unit_price", parseFloat(e.target.value))}
              />
            </div>
          </div>
          {showCommission && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission_rate">Commission Rate</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedService.commission_rate}
                  onChange={(e) => handleChange("commission_rate", parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission_type">Commission Type</Label>
                <select
                  id="commission_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedService.commission_type}
                  onChange={(e) => handleChange("commission_type", e.target.value)}
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={editedService.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancelEdit}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{service.service_name}</h3>
            <p className="text-sm text-muted-foreground">{service.description}</p>
            <div className="mt-2 text-sm">
              <span className="font-medium">
                {service.quantity} x ${service.unit_price.toFixed(2)}
              </span>
              <span className="ml-2 text-muted-foreground">
                = ${(service.quantity * service.unit_price).toFixed(2)}
              </span>
            </div>
            {showCommission && (
              <div className="mt-1 text-sm">
                <span className="text-muted-foreground">
                  Commission: {service.commission_rate}{" "}
                  {service.commission_type === "percentage" ? "%" : "flat"}
                </span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={onEdit} disabled={disabled}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove} disabled={disabled}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
