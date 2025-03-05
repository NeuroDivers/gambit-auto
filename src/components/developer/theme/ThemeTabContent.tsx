
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorCard } from "./ColorCard";
import { ColorVariable, ThemeMode } from "./types";
import { themeColorVariables } from "./themeData";
import { ToastPreview } from "./ToastPreview";
import { Separator } from "@/components/ui/separator";

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

  // Group variables by category for the "all" tab
  const groupedVariables = React.useMemo(() => {
    if (selectedCategory !== "all") return null;
    
    return Object.entries(
      filteredVariables.reduce((acc, variable) => {
        if (!acc[variable.category]) {
          acc[variable.category] = [];
        }
        acc[variable.category].push(variable);
        return acc;
      }, {} as Record<string, ColorVariable[]>)
    ).sort(([a], [b]) => {
      // Custom sort order for categories
      const order = ["base", "components", "states", "avatar", "toast", "tabs"];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [filteredVariables, selectedCategory]);

  // Use auto height for "all" tab with grouped sections
  const scrollAreaClassName = selectedCategory === "all" 
    ? "max-h-full" // Allow the ScrollArea to expand as needed for "all" category
    : "h-[500px]"; // Use fixed height for other categories

  const renderColorCards = (variables: ColorVariable[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {variables.map(variable => (
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
  );

  return (
    <TabsContent value={themeMode} className="mt-0">
      <ScrollArea className={`${scrollAreaClassName} pr-4`}>
        {selectedCategory === "toast" && (
          <div className="mb-6">
            <ToastPreview />
          </div>
        )}
        
        {selectedCategory === "all" && groupedVariables ? (
          <div className="space-y-8">
            {groupedVariables.map(([category, variables]) => (
              <div key={category} className="rounded-lg border p-4 bg-background/50">
                <h3 className="text-lg font-semibold capitalize mb-4">
                  {category === "base" ? "Base Colors" : 
                   category === "components" ? "Components" : 
                   category === "states" ? "States" : 
                   category === "avatar" ? "Avatar" : 
                   category === "toast" ? "Toast" : 
                   category === "tabs" ? "Tabs" : category}
                </h3>
                <Separator className="mb-4" />
                {renderColorCards(variables)}
              </div>
            ))}
          </div>
        ) : (
          renderColorCards(filteredVariables)
        )}
      </ScrollArea>
    </TabsContent>
  );
}
