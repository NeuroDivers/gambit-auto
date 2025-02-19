
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockedDatesList } from "./BlockedDatesList";

interface BlockedDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlockedDatesDialog({ open, onOpenChange }: BlockedDatesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Blocked Dates</DialogTitle>
        </DialogHeader>
        <BlockedDatesList />
      </DialogContent>
    </Dialog>
  );
}
