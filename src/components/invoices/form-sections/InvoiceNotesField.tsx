
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface InvoiceNotesFieldProps {
  value: string;
  onChange: (notes: string) => void;
  disabled?: boolean;
}

export function InvoiceNotesField({ value, onChange, disabled = false }: InvoiceNotesFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        placeholder="Add invoice notes..."
        className="min-h-[100px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
