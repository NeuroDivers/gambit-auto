
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, RotateCcw, Copy, Paintbrush, Save, Code } from "lucide-react";
import { toast } from "sonner";
import { applyThemeClass } from "@/lib/utils";

import { ThemeMode, LOCAL_STORAGE_KEY } from "./theme/types";
import { themeColorVariables, applyCustomThemeColors, getDefaultColors } from "./theme/themeData";
import { hexToHsl } from "./theme/colorUtils";
import { CategoryFilter } from "./theme/CategoryFilter";
import { ThemeTabContent } from "./theme/ThemeTabContent";

export function ThemeColorManager() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [lightColors, setLightColors] = useState<Record<string, string>>({});
  const [darkColors, setDarkColors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("light");
  const [activeColorName, setActiveColorName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const savedThemeColors = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedThemeColors) {
      try {
        const { light, dark } = JSON.parse(savedThemeColors);
        setLightColors(light);
        setDarkColors(dark);
        applyCustomThemeColors(light, dark);
      } catch (error) {
        console.error("Error parsing saved theme colors:", error);
        loadCurrentThemeColors();
      }
    } else {
      loadCurrentThemeColors();
    }
  }, []);

  const loadCurrentThemeColors = () => {
    const lightThemeColors = getDefaultColors('light');
    const darkThemeColors = getDefaultColors('dark');
    
    setLightColors(lightThemeColors);
    setDarkColors(darkThemeColors);
    applyThemeClass(theme, resolvedTheme);
  };

  const handleColorChange = (theme: ThemeMode, name: string, value: string) => {
    if (theme === 'light') {
      setLightColors(prev => ({ ...prev, [name]: value }));
    } else {
      setDarkColors(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleColorPickerChange = (theme: ThemeMode, name: string, hex: string) => {
    const hslValue = hexToHsl(hex);
    handleColorChange(theme, name, hslValue);
  };

  const handleHexInputChange = (theme: ThemeMode, name: string, hex: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      handleColorPickerChange(theme, name, hex);
    }
  };

  const applyThemeColors = () => {
    applyCustomThemeColors(lightColors, darkColors);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      light: lightColors,
      dark: darkColors
    }));
    toast.success("Theme colors applied and saved successfully");
  };

  const resetToDefaults = (themeMode: ThemeMode) => {
    if (themeMode === 'light') {
      setLightColors(getDefaultColors('light'));
    } else {
      setDarkColors(getDefaultColors('dark'));
    }
    toast.success(`${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} theme reset to defaults`);
  };

  const exportThemeColors = () => {
    const themeColors = { light: lightColors, dark: darkColors };
    const jsonString = JSON.stringify(themeColors, null, 2);
    navigator.clipboard.writeText(jsonString);
    toast.success("Theme colors exported to clipboard as JSON");
  };

  const generateCSS = () => {
    let cssText = `:root {\n`;
    themeColorVariables.forEach(variable => {
      cssText += `  --${variable.name}: ${lightColors[variable.name] || variable.defaultLight};\n`;
    });
    cssText += `}\n\n`;
    cssText += `.dark {\n`;
    themeColorVariables.forEach(variable => {
      cssText += `  --${variable.name}: ${darkColors[variable.name] || variable.defaultDark};\n`;
    });
    cssText += `}\n`;
    navigator.clipboard.writeText(cssText);
    toast.success("CSS variables copied to clipboard");
  };

  const previewTheme = (mode: ThemeMode) => {
    setTheme(mode);
    setActiveTab(mode);
    toast.success(`Previewing ${mode} theme`);
  };

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
      </CardContent>
    </Card>
  );
}
