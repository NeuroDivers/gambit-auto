
import React from "react";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";

export function ToastPreview() {
  const showDefaultToast = () => {
    toast("Default Toast", {
      description: "This is a default toast notification",
      duration: 3000,
    });
  };

  const showDestructiveToast = () => {
    toast.error("Error Toast", {
      description: "This is a destructive toast notification",
      duration: 3000,
    });
  };

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Megaphone className="h-4 w-4" />
        <h3 className="text-sm font-medium">Toast Preview</h3>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Click to test toast notifications with current theme colors
      </p>

      <div className="flex gap-3">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={showDefaultToast}
          className="text-xs h-8"
        >
          Show Default Toast
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={showDestructiveToast}
          className="text-xs h-8"
        >
          Show Error Toast
        </Button>
      </div>
    </div>
  );
}
