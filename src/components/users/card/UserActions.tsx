
import { Button } from "@/components/ui/button";
import { Edit2, Trash } from "lucide-react";

type UserActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export const UserActions = ({ onEdit, onDelete }: UserActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};
