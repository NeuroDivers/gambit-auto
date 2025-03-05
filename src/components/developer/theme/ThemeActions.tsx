
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Save } from "lucide-react";
import { toast } from "sonner";
import { ThemeMode } from "./types";

interface ThemeActionsProps {
  exportThemeColors: () => void;
  applyThemeColors: () => void;
}

export function ThemeActions({ exportThemeColors, applyThemeColors }: ThemeActionsProps) {
  return (
    <>
      <Separator className="my-4" />
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button variant="outline" onClick={exportThemeColors} className="gap-2">
          <Copy className="h-4 w-4" />
          Export Theme
        </Button>
        <Button onClick={applyThemeColors} className="gap-2">
          <Save className="h-4 w-4" />
          Apply Theme Colors
        </Button>
      </div>
    </>
  );
}
