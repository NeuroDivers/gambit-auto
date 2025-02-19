
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"

interface ServiceCardActionsProps {
  serviceId: string;
  onEdit: () => void;
  onRefetch: () => void;
}

export const ServiceCardActions = ({ serviceId, onEdit, onRefetch }: ServiceCardActionsProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service type deleted successfully",
      });

      onRefetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-1 shrink-0">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        onClick={handleDelete}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};
