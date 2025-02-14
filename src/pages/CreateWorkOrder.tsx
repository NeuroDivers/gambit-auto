
import { useNavigate } from "react-router-dom";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CreateWorkOrder() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    setTimeout(() => {
      navigate("/work-orders");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-6">
        <div className="px-6">
          <PageBreadcrumbs />
          <div className="mb-4">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate("/work-orders")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Work Orders
            </Button>
          </div>
        </div>
        <div id="radix-portal-container" />
        <ScrollArea className="h-[calc(100vh-8rem)] px-6">
          <div className="max-w-4xl mx-auto">
            <WorkOrderForm onSuccess={handleSuccess} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
