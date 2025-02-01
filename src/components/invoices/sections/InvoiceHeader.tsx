import { formatDate } from "@/lib/utils";

type InvoiceHeaderProps = {
  invoiceNumber: string;
  createdAt: string;
  dueDate?: string | null;
}

export function InvoiceHeader({ invoiceNumber, createdAt, dueDate }: InvoiceHeaderProps) {
  return (
    <div className="flex justify-between">
      <div>
        <h1 className="text-2xl font-bold">Invoice #{invoiceNumber}</h1>
        <p className="text-muted-foreground">Date: {formatDate(createdAt)}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">Due Date</p>
        <p>{dueDate ? formatDate(dueDate) : 'N/A'}</p>
      </div>
    </div>
  );
}