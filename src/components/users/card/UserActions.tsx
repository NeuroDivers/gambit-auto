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
        className="text-white/60 hover:text-white/[0.87] hover:bg-white/[0.08]"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-white/60 hover:text-red-500 hover:bg-white/[0.08]"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};