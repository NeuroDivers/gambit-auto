
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

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
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
