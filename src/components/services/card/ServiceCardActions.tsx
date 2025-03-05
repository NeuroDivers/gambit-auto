
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface ServiceCardActionsProps {
  serviceId: string;
  onEdit: () => void;
  onRefetch: () => void;
}

export const ServiceCardActions = ({ serviceId, onEdit, onRefetch }: ServiceCardActionsProps) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast("Success", {
        description: "Service type deleted successfully",
      });

      onRefetch();
    } catch (error: any) {
      toast("Error", {
        description: error.message,
        style: { backgroundColor: 'red', color: 'white' }
      });
    }
  };

  return (
    <div className="p-4 pt-0 flex justify-end gap-2 shrink-0">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={handleDelete}
      >
        <Trash className="h-4 w-4" />
        Delete
      </Button>
      <Button 
        size="sm" 
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
        Edit
      </Button>
    </div>
  );
};
