
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorCard } from "./ColorCard";
import { ColorVariable, ThemeMode } from "./types";
import { themeColorVariables } from "./themeData";

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
  const getFilteredVariables = () => {
    return themeColorVariables.filter(
      variable => selectedCategory === "all" || variable.category === selectedCategory
    );
  };

  return (
    <TabsContent value={themeMode} className="mt-0">
      <ScrollArea className="h-[500px] pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredVariables().map(variable => (
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
