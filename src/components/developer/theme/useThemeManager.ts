
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ThemeMode, LOCAL_STORAGE_KEY } from "./types";
import { themeColorVariables, applyCustomThemeColors, getDefaultColors } from "./themeData";
import { hexToHsl } from "./colorUtils";
import { applyThemeClass } from "@/lib/utils";

export function useThemeManager() {
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

  return {
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
  };
}
