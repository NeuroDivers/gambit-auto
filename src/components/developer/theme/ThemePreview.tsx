
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ThemeMode } from "./types";

interface ThemePreviewProps {
  previewTheme: (mode: ThemeMode) => void;
}

export function ThemePreview({ previewTheme }: ThemePreviewProps) {
  return (
    <div className="flex gap-2 mt-4">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => previewTheme('light')}
        className="h-8"
      >
        Preview Light
      </Button>
      <Button 
        variant="outline"
        size="sm"
        onClick={() => previewTheme('dark')}
        className="h-8"
      >
        Preview Dark
      </Button>
    </div>
  );
}
