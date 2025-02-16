import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { WorkOrderForm } from "./WorkOrderForm";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
type CreateWorkOrderDialogProps = {
  defaultStartTime?: Date;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
export function CreateWorkOrderDialog({
  defaultStartTime,
  open: controlledOpen,
  onOpenChange
}: CreateWorkOrderDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogClose className="fixed top-4 right-4 z-[200] rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <WorkOrderForm onSuccess={() => setOpen(false)} defaultStartTime={defaultStartTime} onSubmitting={setIsSubmitting} />
        </div>
      </DialogContent>
    </Dialog>;
}