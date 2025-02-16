
import React from 'react';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ServiceItemType } from "@/components/work-orders/types"

interface ServiceQuantityPriceProps {
  index: number;
  item: ServiceItemType;
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void;
  mounted: React.MutableRefObject<boolean>;
}

export function ServiceQuantityPrice({ index, item, onUpdate, mounted }: ServiceQuantityPriceProps) {
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!mounted.current) return;
    
    const quantity = parseInt(event.target.value) || 1;
    onUpdate(index, "quantity", quantity);
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!mounted.current) return;
    
    const price = parseFloat(event.target.value) || 0;
    onUpdate(index, "unit_price", price);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
        <Input
          id={`quantity-${index}`}
          type="number"
          min={1}
          value={item.quantity}
          onChange={handleQuantityChange}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor={`price-${index}`}>Unit Price</Label>
        <Input
          id={`price-${index}`}
          type="number"
          min={0}
          step="0.01"
          value={item.unit_price}
          onChange={handlePriceChange}
          className="mt-1"
        />
      </div>
    </div>
  );
}
