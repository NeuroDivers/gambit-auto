
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ServiceItemType } from "./types"

interface ServiceQuantityPriceProps {
  index: number;
  item: ServiceItemType;
  onUpdate: (index: number, field: keyof ServiceItemType, value: any) => void;
  mounted: React.MutableRefObject<boolean>;
}

export function ServiceQuantityPrice({ index, item, onUpdate, mounted }: ServiceQuantityPriceProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
        <Input
          id={`quantity-${index}`}
          type="number"
          value={item.quantity || 1}
          onChange={(e) => {
            if (mounted.current) {
              onUpdate(index, "quantity", parseInt(e.target.value) || 1);
            }
          }}
          min={1}
          className="mt-1"
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor={`unit-price-${index}`}>Unit Price</Label>
        <Input
          id={`unit-price-${index}`}
          type="number"
          value={item.unit_price || 0}
          onChange={(e) => {
            if (mounted.current) {
              onUpdate(index, "unit_price", parseFloat(e.target.value) || 0);
            }
          }}
          min={0}
          step="0.01"
          className="mt-1"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
