
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Moon, RotateCcw, Sun, Code } from "lucide-react";
import { ThemeMode } from "./types";

interface ThemeHeaderProps {
  activeTab: string;
  resetToDefaults: (themeMode: ThemeMode) => void;
  generateCSS: () => void;
}

export function ThemeHeader({ activeTab, resetToDefaults, generateCSS }: ThemeHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <TabsList>
        <TabsTrigger 
          value="light" 
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          Light Theme
        </TabsTrigger>
        <TabsTrigger 
          value="dark" 
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          Dark Theme
        </TabsTrigger>
      </TabsList>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => resetToDefaults(activeTab as ThemeMode)} 
          className="h-8"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateCSS} 
          className="h-8"
        >
          <Code className="h-3.5 w-3.5 mr-1.5" />
          Copy CSS
        </Button>
      </div>
    </div>
  );
}
