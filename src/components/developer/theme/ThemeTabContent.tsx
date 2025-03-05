
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorCard } from "./ColorCard";
import { ColorVariable, ThemeMode } from "./types";
import { themeColorVariables } from "./themeData";
import { ToastPreview } from "./ToastPreview";

interface ThemeTabContentProps {
  themeMode: ThemeMode;
  colors: Record<string, string>;
  selectedCategory: string;
  handleColorChange: (theme: ThemeMode, name: string, value: string) => void;
  handleColorPickerChange: (theme: ThemeMode, name: string, hex: string) => void;
  handleHexInputChange: (theme: ThemeMode, name: string, hex: string) => void;
  activeColorName: string | null;
  setActiveColorName: (name: string | null) => void;
}

export function ThemeTabContent({
  themeMode,
  colors,
  selectedCategory,
  handleColorChange,
  handleColorPickerChange,
  handleHexInputChange,
  activeColorName,
  setActiveColorName
}: ThemeTabContentProps) {
  // Get filtered variables based on selected category
  const filteredVariables = 
    selectedCategory === "all" 
      ? themeColorVariables // Show all variables when "all" is selected
      : themeColorVariables.filter(variable => variable.category === selectedCategory);

  console.log(`Showing ${filteredVariables.length} color variables in ${selectedCategory} tab`);

  return (
    <TabsContent value={themeMode} className="mt-0">
      <ScrollArea className="h-[500px] pr-4">
        {selectedCategory === "toast" && (
          <div className="mb-6">
            <ToastPreview />
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVariables.map(variable => (
            <ColorCard
              key={`${themeMode}-${variable.name}`}
              variable={variable}
              themeMode={themeMode}
              colors={colors}
              handleColorChange={handleColorChange}
              handleColorPickerChange={handleColorPickerChange}
              handleHexInputChange={handleHexInputChange}
              activeColorName={activeColorName}
              setActiveColorName={setActiveColorName}
            />
          ))}
        </div>
      </ScrollArea>
    </TabsContent>
  );
}
