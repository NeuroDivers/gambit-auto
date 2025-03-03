
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pencil, Trash, Loader2 } from "lucide-react";
import { ServiceCardHeader } from "./card/ServiceCardHeader";
import { ServiceCardContent } from "./card/ServiceCardContent";
import { ServiceTypeBadge } from "./card/ServiceTypeBadge";
import { ServiceType } from "./hooks/useServiceTypes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ServiceTypeCardProps {
  service: ServiceType;
  onEdit: () => void;
  onRefetch: () => void;
}

export const ServiceTypeCard = ({ service, onEdit, onRefetch }: ServiceTypeCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasSubServices = service.sub_services && service.sub_services.length > 0;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First check if there are any bundle references
      const { data: bundleServices, error: checkError } = await supabase
        .from("bundle_services")
        .select("*")
        .or(`bundle_id.eq.${service.id},service_id.eq.${service.id}`);

      if (checkError) {
        console.error("Error checking bundle services:", checkError);
        toast.error("Failed to check service references");
        setIsDeleting(false);
        return;
      }

      // If there are bundle references, try to delete them first
      if (bundleServices && bundleServices.length > 0) {
        const { error: deleteRefError } = await supabase
          .from("bundle_services")
          .delete()
          .or(`bundle_id.eq.${service.id},service_id.eq.${service.id}`);

        if (deleteRefError) {
          console.error("Error deleting bundle relationships:", deleteRefError);
          toast.error("Failed to delete service relationships");
          setIsDeleting(false);
          return;
        }
      }

      // Check for invoice item references
      const { data: invoiceItems, error: invoiceItemsError } = await supabase
        .from("invoice_items")
        .select("id")
        .eq("service_id", service.id);

      if (invoiceItemsError) {
        console.error("Error checking invoice items:", invoiceItemsError);
      } else if (invoiceItems && invoiceItems.length > 0) {
        toast.error("Cannot delete service that is referenced in invoices");
        setIsDeleting(false);
        return;
      }

      // Now try to delete the service type
      const { error: deleteError } = await supabase
        .from("service_types")
        .delete()
        .eq("id", service.id);

      if (deleteError) {
        console.error("Error deleting service:", deleteError);
        toast.error("Failed to delete service: " + deleteError.message);
      } else {
        toast.success("Service deleted successfully");
        onRefetch();
      }
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <ServiceCardHeader 
          service={service} 
          hasSubServices={hasSubServices}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
        />
        <ServiceCardContent 
          service={service} 
          isExpanded={isExpanded} 
        />
        <CardContent className="flex justify-end mt-auto pt-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onEdit}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service type? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
