
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface InvoiceStatusFieldProps {
  value: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}

export function InvoiceStatusField({ value, onChange, disabled = false }: InvoiceStatusFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="status" className="w-full">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
