
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Paintbrush } from "lucide-react";

import { ThemeMode } from "./theme/types";
import { CategoryFilter } from "./theme/CategoryFilter";
import { ThemeTabContent } from "./theme/ThemeTabContent";
import { ThemeHeader } from "./theme/ThemeHeader";
import { ThemeActions } from "./theme/ThemeActions";
import { ThemePreview } from "./theme/ThemePreview";
import { useThemeManager } from "./theme/useThemeManager";

export function ThemeColorManager() {
  const {
    lightColors,
    darkColors,
    activeTab,
    activeColorName,
    selectedCategory,
    setActiveTab,
    setSelectedCategory,
    setActiveColorName,
    handleColorChange,
    handleColorPickerChange,
    handleHexInputChange,
    applyThemeColors,
    resetToDefaults,
    exportThemeColors,
    generateCSS,
    previewTheme
  } = useThemeManager();

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Theme Color Editor
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="light" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ThemeHeader 
            activeTab={activeTab}
            resetToDefaults={resetToDefaults}
            generateCSS={generateCSS}
          />
          
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />
          
          <ThemeTabContent 
            themeMode="light"
            colors={lightColors}
            selectedCategory={selectedCategory}
            handleColorChange={handleColorChange}
            handleColorPickerChange={handleColorPickerChange}
            handleHexInputChange={handleHexInputChange}
            activeColorName={activeColorName}
            setActiveColorName={setActiveColorName}
          />
          
          <ThemeTabContent 
            themeMode="dark"
            colors={darkColors}
            selectedCategory={selectedCategory}
            handleColorChange={handleColorChange}
            handleColorPickerChange={handleColorPickerChange}
            handleHexInputChange={handleHexInputChange}
            activeColorName={activeColorName}
            setActiveColorName={setActiveColorName}
          />
        </Tabs>
        
        <ThemePreview previewTheme={previewTheme} />
        
        <ThemeActions 
          exportThemeColors={exportThemeColors}
          applyThemeColors={applyThemeColors}
        />
      </CardContent>
    </Card>
  );
}
