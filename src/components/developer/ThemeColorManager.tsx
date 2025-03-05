import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, RotateCcw, Copy, Paintbrush, Save, Code, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { applyThemeClass } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColorVariable {
  name: string;
  description: string;
  defaultLight: string;
  defaultDark: string;
  category: "base" | "components" | "states" | "text" | "tabs";
}

const themeColorVariables: ColorVariable[] = [
// Base colors
{
  name: "background",
  description: "Main background color",
  defaultLight: "0 0% 100%",
  defaultDark: "260 15% 8%",
  category: "base"
}, {
  name: "foreground",
  description: "Main text color",
  defaultLight: "240 10% 3.9%",
  defaultDark: "210 40% 98%",
  category: "base"
}, {
  name: "primary",
  description: "Primary action color",
  defaultLight: "262 83.3% 57.8%",
  defaultDark: "262 83.3% 75%",
  category: "base"
}, {
  name: "primary-foreground",
  description: "Text on primary color",
  defaultLight: "0 0% 100%",
  defaultDark: "0 0% 100%",
  category: "base"
}, {
  name: "secondary",
  description: "Secondary color",
  defaultLight: "240 4.8% 95.9%",
  defaultDark: "260 15% 18%",
  category: "base"
}, {
  name: "secondary-foreground",
  description: "Text on secondary color",
  defaultLight: "240 5.9% 10%",
  defaultDark: "210 40% 98%",
  category: "base"
}, {
  name: "accent",
  description: "Accent color",
  defaultLight: "262 83.3% 57.8%",
  defaultDark: "262 83.3% 30%",
  category: "base"
}, {
  name: "accent-foreground",
  description: "Text on accent color",
  defaultLight: "0 0% 100%",
  defaultDark: "210 40% 98%",
  category: "base"
},
// Component colors
{
  name: "card",
  description: "Card background color",
  defaultLight: "0 0% 100%",
  defaultDark: "260 15% 11%",
  category: "components"
}, {
  name: "card-foreground",
  description: "Card text color",
  defaultLight: "240 10% 3.9%",
  defaultDark: "210 40% 98%",
  category: "components"
}, {
  name: "popover",
  description: "Popover background",
  defaultLight: "0 0% 100%",
  defaultDark: "260 15% 11%",
  category: "components"
}, {
  name: "popover-foreground",
  description: "Popover text",
  defaultLight: "240 10% 3.9%",
  defaultDark: "210 40% 98%",
  category: "components"
}, {
  name: "input",
  description: "Input border color",
  defaultLight: "240 5.9% 90%",
  defaultDark: "260 15% 22%",
  category: "components"
}, {
  name: "border",
  description: "Border color",
  defaultLight: "240 5.9% 90%",
  defaultDark: "260 15% 22%",
  category: "components"
}, {
  name: "ring",
  description: "Focus ring color",
  defaultLight: "262 83.3% 57.8%",
  defaultDark: "262 83.3% 75%",
  category: "components"
},
// States
{
  name: "muted",
  description: "Muted background color",
  defaultLight: "240 4.8% 95.9%",
  defaultDark: "260 15% 18%",
  category: "states"
}, {
  name: "muted-foreground",
  description: "Muted text color",
  defaultLight: "240 3.8% 46.1%",
  defaultDark: "217 10% 70%",
  category: "states"
}, {
  name: "destructive",
  description: "Destructive action color",
  defaultLight: "0 84.2% 60.2%",
  defaultDark: "0 62.8% 40.6%",
  category: "states"
}, {
  name: "destructive-foreground",
  description: "Text on destructive color",
  defaultLight: "0 0% 98%",
  defaultDark: "210 40% 98%",
  category: "states"
},
// Tab specific colors
{
  name: "tabs-list",
  description: "Tab list background",
  defaultLight: "240 4.8% 95.9%",
  defaultDark: "260 15% 18%",
  category: "tabs"
}, {
  name: "tabs-list-foreground",
  description: "Tab list text color",
  defaultLight: "240 3.8% 46.1%",
  defaultDark: "217 10% 70%",
  category: "tabs"
}, {
  name: "tabs-trigger-hover",
  description: "Tab hover background",
  defaultLight: "240 4.8% 95.9%",
  defaultDark: "260 15% 18%",
  category: "tabs"
}, {
  name: "tabs-trigger-hover-foreground",
  description: "Tab hover text color",
  defaultLight: "240 5.9% 10%",
  defaultDark: "210 40% 98%",
  category: "tabs"
}, {
  name: "tabs-trigger-active",
  description: "Active tab background",
  defaultLight: "262 83.3% 57.8%",
  defaultDark: "262 83.3% 75%",
  category: "tabs"
}, {
  name: "tabs-trigger-active-foreground",
  description: "Active tab text color",
  defaultLight: "0 0% 100%",
  defaultDark: "0 0% 100%",
  category: "tabs"
}];

const LOCAL_STORAGE_KEY = "custom-theme-colors";

function hslToHex(hslString: string): string {
  const [h, s, l] = hslString.split(' ').map(val => parseFloat(val.replace('%', '')));
  const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = l / 100 - c / 2;
  let r, g, b;
  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  const toHex = (n: number): string => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsl(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return `${h} ${s}% ${l}%`;
}

function applyCustomThemeColors(lightColors: Record<string, string>, darkColors: Record<string, string>) {
  const style = document.createElement('style');
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
  style.textContent = cssText;
  const existingStyle = document.getElementById('theme-colors-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  style.id = 'theme-colors-style';
  document.head.appendChild(style);
}

export function ThemeColorManager() {
  const {
    theme,
    setTheme,
    resolvedTheme
  } = useTheme();
  const [lightColors, setLightColors] = useState<Record<string, string>>({});
  const [darkColors, setDarkColors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("light");
  const [activeColorName, setActiveColorName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const savedThemeColors = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedThemeColors) {
      try {
        const {
          light,
          dark
        } = JSON.parse(savedThemeColors);
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
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const lightThemeColors: Record<string, string> = {};
    const darkThemeColors: Record<string, string> = {};
    themeColorVariables.forEach(variable => {
      lightThemeColors[variable.name] = variable.defaultLight;
      darkThemeColors[variable.name] = variable.defaultDark;
    });
    setLightColors(lightThemeColors);
    setDarkColors(darkThemeColors);
    applyThemeClass(theme, resolvedTheme);
  };

  const handleColorChange = (theme: 'light' | 'dark', name: string, value: string) => {
    if (theme === 'light') {
      setLightColors(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setDarkColors(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleColorPickerChange = (theme: 'light' | 'dark', name: string, hex: string) => {
    const hslValue = hexToHsl(hex);
    handleColorChange(theme, name, hslValue);
  };

  const handleHexInputChange = (theme: 'light' | 'dark', name: string, hex: string) => {
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

  const resetToDefaults = (themeMode: 'light' | 'dark') => {
    if (themeMode === 'light') {
      const defaultLight = themeColorVariables.reduce((acc, variable) => {
        acc[variable.name] = variable.defaultLight;
        return acc;
      }, {} as Record<string, string>);
      setLightColors(defaultLight);
    } else {
      const defaultDark = themeColorVariables.reduce((acc, variable) => {
        acc[variable.name] = variable.defaultDark;
        return acc;
      }, {} as Record<string, string>);
      setDarkColors(defaultDark);
    }
    toast.success(`${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} theme reset to defaults`);
  };

  const exportThemeColors = () => {
    const themeColors = {
      light: lightColors,
      dark: darkColors
    };
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

  const previewTheme = (mode: 'light' | 'dark') => {
    setTheme(mode);
    setActiveTab(mode);
    toast.success(`Previewing ${mode} theme`);
  };

  const getFilteredVariables = () => {
    return themeColorVariables.filter(variable => selectedCategory === "all" || variable.category === selectedCategory);
  };

  const ColorPicker = ({
    name,
    value,
    onChange,
    theme
  }: {
    name: string;
    value: string;
    onChange: (hex: string) => void;
    theme: 'light' | 'dark';
  }) => {
    const hexColor = hslToHex(value);
    const isOpen = activeColorName === `${theme}-${name}`;
    return <Popover open={isOpen} onOpenChange={open => {
      if (open) {
        setActiveColorName(`${theme}-${name}`);
      } else {
        setActiveColorName(null);
      }
    }}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-10 h-10 p-0 border-2" style={{
          backgroundColor: hexColor
        }}>
            <span className="sr-only">Pick a color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="right" sideOffset={10}>
          <div className="p-3" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
            <HexColorPicker color={hexColor} onChange={onChange} onMouseDown={e => e.stopPropagation()} />
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex justify-between items-center">
                <Label>Hex</Label>
                <Input value={hexColor} onChange={e => onChange(e.target.value)} className="w-24 font-mono" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} />
              </div>
              <div className="flex justify-between">
                <Label>HSL</Label>
                <span className="font-mono text-xs">{value}</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>;
  };

  const ColorCard = ({
    variable,
    themeMode
  }: {
    variable: ColorVariable;
    themeMode: 'light' | 'dark';
  }) => {
    const colors = themeMode === 'light' ? lightColors : darkColors;
    const hslValue = colors[variable.name] || (themeMode === 'light' ? variable.defaultLight : variable.defaultDark);
    const hexValue = hslToHex(hslValue);
    return <div className="bg-card rounded-lg border p-4 space-y-3 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">{variable.name}</h3>
            <p className="text-xs text-muted-foreground">{variable.description}</p>
          </div>
          <div className="h-6 w-6 rounded-full border" style={{
          background: `hsl(${hslValue})`
        }} />
        </div>
        
        <div className="grid gap-2">
          <div className="flex gap-2 items-center">
            <Input id={`${themeMode}-${variable.name}`} value={hslValue} onChange={e => handleColorChange(themeMode, variable.name, e.target.value)} placeholder={themeMode === 'light' ? variable.defaultLight : variable.defaultDark} className="flex-1 h-8 text-xs" />
            <ColorPicker name={variable.name} value={hslValue} onChange={hex => handleColorPickerChange(themeMode, variable.name, hex)} theme={themeMode} />
          </div>
          
          <div className="flex items-center">
            <Input value={hexValue} onChange={e => handleHexInputChange(themeMode, variable.name, e.target.value)} className="h-7 text-xs font-mono w-full" placeholder="Hex color" />
          </div>
        </div>
      </div>;
  };

  return <Card className="bg-transparent border-none shadow-none">
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
            <TabsList className="bg-muted/60">
              <TabsTrigger value="light" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sun className="h-4 w-4" />
                Light Theme
              </TabsTrigger>
              <TabsTrigger value="dark" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Moon className="h-4 w-4" />
                Dark Theme
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => resetToDefaults(activeTab as 'light' | 'dark')} className="h-8">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={generateCSS} className="h-8">
                <Code className="h-3.5 w-3.5 mr-1.5" />
                Copy CSS
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={selectedCategory === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
              All
            </Badge>
            <Badge variant={selectedCategory === "base" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory("base")}>
              Base Colors
            </Badge>
            <Badge variant={selectedCategory === "components" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory("components")}>
              Components
            </Badge>
            <Badge variant={selectedCategory === "states" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory("states")}>
              States
            </Badge>
            <Badge variant={selectedCategory === "tabs" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory("tabs")}>
              Tabs
            </Badge>
          </div>
          
          <TabsContent value="light" className="mt-0">
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredVariables().map(variable => <ColorCard key={`light-${variable.name}`} variable={variable} themeMode="light" />)}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="dark" className="mt-0">
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredVariables().map(variable => <ColorCard key={`dark-${variable.name}`} variable={variable} themeMode="dark" />)}
              </div>
            </ScrollArea>
          </TabsContent>
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
    </Card>;
}
