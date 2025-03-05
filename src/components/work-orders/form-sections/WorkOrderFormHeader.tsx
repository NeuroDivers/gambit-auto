
import { format } from "date-fns";

export interface WorkOrderFormHeaderProps {
  customerName?: string;
  date?: Date | string | null;
}

export function WorkOrderFormHeader({
  customerName,
  date
}: WorkOrderFormHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
      <div>
        <h2 className="text-2xl font-bold">
          {customerName ? customerName : "New Work Order"}
        </h2>
        {date && (
          <p className="text-sm text-muted-foreground">
            {typeof date === 'string' 
              ? format(new Date(date), 'PPP')
              : date instanceof Date 
                ? format(date, 'PPP') 
                : null}
          </p>
        )}
      </div>
    </div>
  );
}
