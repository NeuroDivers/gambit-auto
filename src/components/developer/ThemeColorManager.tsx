import React, { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Moon, 
  Sun, 
  RotateCcw,
  Copy,
  Paintbrush
} from "lucide-react"
import { toast } from "sonner"
import { applyThemeClass } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HexColorPicker } from "react-colorful"

interface ColorVariable {
  name: string;
  description: string;
  defaultLight: string;
  defaultDark: string;
}

const themeColorVariables: ColorVariable[] = [
  { name: "background", description: "Main background color", defaultLight: "0 0% 100%", defaultDark: "260 15% 8%" },
  { name: "foreground", description: "Main text color", defaultLight: "240 10% 3.9%", defaultDark: "210 40% 98%" },
  { name: "card", description: "Card background color", defaultLight: "0 0% 100%", defaultDark: "260 15% 11%" },
  { name: "card-foreground", description: "Card text color", defaultLight: "240 10% 3.9%", defaultDark: "210 40% 98%" },
  { name: "primary", description: "Primary action color", defaultLight: "262 83.3% 57.8%", defaultDark: "262 83.3% 75%" },
  { name: "primary-foreground", description: "Text on primary color", defaultLight: "0 0% 100%", defaultDark: "0 0% 100%" },
  { name: "secondary", description: "Secondary color", defaultLight: "240 4.8% 95.9%", defaultDark: "260 15% 18%" },
  { name: "secondary-foreground", description: "Text on secondary color", defaultLight: "240 5.9% 10%", defaultDark: "210 40% 98%" },
  { name: "muted", description: "Muted background color", defaultLight: "240 4.8% 95.9%", defaultDark: "260 15% 18%" },
  { name: "muted-foreground", description: "Muted text color", defaultLight: "240 3.8% 46.1%", defaultDark: "217 10% 70%" },
  { name: "accent", description: "Accent color", defaultLight: "262 83.3% 57.8%", defaultDark: "262 83.3% 30%" },
  { name: "accent-foreground", description: "Text on accent color", defaultLight: "0 0% 100%", defaultDark: "210 40% 98%" },
  { name: "destructive", description: "Destructive action color", defaultLight: "0 84.2% 60.2%", defaultDark: "0 62.8% 40.6%" },
  { name: "destructive-foreground", description: "Text on destructive color", defaultLight: "0 0% 98%", defaultDark: "210 40% 98%" },
  { name: "border", description: "Border color", defaultLight: "240 5.9% 90%", defaultDark: "260 15% 22%" },
  { name: "input", description: "Input border color", defaultLight: "240 5.9% 90%", defaultDark: "260 15% 22%" },
  { name: "ring", description: "Focus ring color", defaultLight: "262 83.3% 57.8%", defaultDark: "262 83.3% 75%" }
];

const LOCAL_STORAGE_KEY = "custom-theme-colors";

function hslToHex(hslString: string): string {
  const [h, s, l] = hslString.split(' ').map(val => parseFloat(val.replace('%', '')));
  
  const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
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
  let h = 0, s = 0, l = (max + min) / 2;
  
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

export function ThemeColorManager() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [lightColors, setLightColors] = useState<Record<string, string>>({})
  const [darkColors, setDarkColors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<string>("light")
  const [activeColorName, setActiveColorName] = useState<string | null>(null)
  
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
  }, [])
  
  const loadCurrentThemeColors = () => {
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)
    
    const lightThemeColors: Record<string, string> = {}
    const darkThemeColors: Record<string, string> = {}
    
    themeColorVariables.forEach(variable => {
      lightThemeColors[variable.name] = variable.defaultLight;
      darkThemeColors[variable.name] = variable.defaultDark;
    })
    
    setLightColors(lightThemeColors)
    setDarkColors(darkThemeColors)
    
    applyThemeClass(theme, resolvedTheme)
  }
  
  const handleColorChange = (theme: 'light' | 'dark', name: string, value: string) => {
    if (theme === 'light') {
      setLightColors(prev => ({ ...prev, [name]: value }))
    } else {
      setDarkColors(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleColorPickerChange = (theme: 'light' | 'dark', name: string, hex: string) => {
    const hslValue = hexToHsl(hex);
    handleColorChange(theme, name, hslValue);
  }
  
  const applyThemeColors = () => {
    applyCustomThemeColors(lightColors, darkColors);
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      light: lightColors,
      dark: darkColors
    }));
    
    toast.success("Theme colors applied and saved successfully")
  }
  
  const applyCustomThemeColors = (lightColors: Record<string, string>, darkColors: Record<string, string>) => {
    const style = document.createElement('style')
    
    let cssText = `:root {\n`
    themeColorVariables.forEach(variable => {
      cssText += `  --${variable.name}: ${lightColors[variable.name] || variable.defaultLight};\n`
    })
    cssText += `}\n\n`
    
    cssText += `.dark {\n`
    themeColorVariables.forEach(variable => {
      cssText += `  --${variable.name}: ${darkColors[variable.name] || variable.defaultDark};\n`
    })
    cssText += `}\n`
    
    style.textContent = cssText
    
    const existingStyle = document.getElementById('theme-colors-style')
    if (existingStyle) {
      existingStyle.remove()
    }
    
    style.id = 'theme-colors-style'
    document.head.appendChild(style)
    
    applyThemeClass(theme, resolvedTheme)
  }
  
  const resetToDefaults = (themeMode: 'light' | 'dark') => {
    if (themeMode === 'light') {
      const defaultLight = themeColorVariables.reduce((acc, variable) => {
        acc[variable.name] = variable.defaultLight
        return acc
      }, {} as Record<string, string>)
      
      setLightColors(defaultLight)
    } else {
      const defaultDark = themeColorVariables.reduce((acc, variable) => {
        acc[variable.name] = variable.defaultDark
        return acc
      }, {} as Record<string, string>)
      
      setDarkColors(defaultDark)
    }
    
    toast.success(`${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} theme reset to defaults`)
  }
  
  const exportThemeColors = () => {
    const themeColors = {
      light: lightColors,
      dark: darkColors
    }
    
    const jsonString = JSON.stringify(themeColors, null, 2)
    navigator.clipboard.writeText(jsonString)
    toast.success("Theme colors exported to clipboard as JSON")
  }
  
  const generateCSS = () => {
    let cssText = `:root {\n`
    themeColorVariables.forEach(variable => {
      cssText += `  --${variable.name}: ${lightColors[variable.name] || variable.defaultLight};\n`
    })
    cssText += `}\n\n`
    
    cssText += `.dark {\n`
    themeColorVariables.forEach(variable => {
      cssText += `  --${variable.name}: ${darkColors[variable.name] || variable.defaultDark};\n`
    })
    cssText += `}\n`
    
    navigator.clipboard.writeText(cssText)
    toast.success("CSS variables copied to clipboard")
  }

  const ColorPicker = ({ 
    name,
    value, 
    onChange,
    theme
  }: { 
    name: string,
    value: string, 
    onChange: (hex: string) => void,
    theme: 'light' | 'dark'
  }) => {
    const hexColor = hslToHex(value);
    const isOpen = activeColorName === `${theme}-${name}`;
    
    return (
      <Popover 
        open={isOpen} 
        onOpenChange={(open) => {
          if (open) {
            setActiveColorName(`${theme}-${name}`);
          } else {
            setActiveColorName(null);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-10 h-10 p-0 border-2"
            style={{ backgroundColor: hexColor }}
          >
            <span className="sr-only">Pick a color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          side="right"
          sideOffset={10}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="mb-3"
              onMouseDown={(e) => e.preventDefault()}
            >
              <HexColorPicker 
                color={hexColor} 
                onChange={onChange} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Label>Hex</Label>
                <Input
                  value={hexColor}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-24 font-mono"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex justify-between">
                <Label>HSL</Label>
                <span className="font-mono text-xs">{value}</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <Tabs 
          defaultValue="light" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="light" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Light Theme
              </TabsTrigger>
              <TabsTrigger value="dark" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Dark Theme
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => resetToDefaults(activeTab as 'light' | 'dark')}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset {activeTab === 'light' ? 'Light' : 'Dark'} Theme
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateCSS}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy CSS
              </Button>
            </div>
          </div>
          
          <TabsContent value="light" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {themeColorVariables.map((variable) => (
                <div key={`light-${variable.name}`} className="space-y-2">
                  <Label htmlFor={`light-${variable.name}`} className="flex items-center justify-between">
                    <span>{variable.name}</span>
                    <div 
                      className="h-4 w-4 rounded-full border"
                      style={{ 
                        background: `hsl(${lightColors[variable.name] || variable.defaultLight})` 
                      }}
                    />
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id={`light-${variable.name}`}
                      value={lightColors[variable.name] || variable.defaultLight}
                      onChange={(e) => handleColorChange('light', variable.name, e.target.value)}
                      placeholder={variable.defaultLight}
                      className="flex-1"
                    />
                    <ColorPicker
                      name={variable.name}
                      value={lightColors[variable.name] || variable.defaultLight}
                      onChange={(hex) => handleColorPickerChange('light', variable.name, hex)}
                      theme="light"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{variable.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="dark" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {themeColorVariables.map((variable) => (
                <div key={`dark-${variable.name}`} className="space-y-2">
                  <Label htmlFor={`dark-${variable.name}`} className="flex items-center justify-between">
                    <span>{variable.name}</span>
                    <div 
                      className="h-4 w-4 rounded-full border dark:border-gray-600"
                      style={{ 
                        background: `hsl(${darkColors[variable.name] || variable.defaultDark})` 
                      }}
                    />
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id={`dark-${variable.name}`}
                      value={darkColors[variable.name] || variable.defaultDark}
                      onChange={(e) => handleColorChange('dark', variable.name, e.target.value)}
                      placeholder={variable.defaultDark}
                      className="flex-1"
                    />
                    <ColorPicker
                      name={variable.name}
                      value={darkColors[variable.name] || variable.defaultDark}
                      onChange={(hex) => handleColorPickerChange('dark', variable.name, hex)}
                      theme="dark"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{variable.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button 
            variant="outline" 
            onClick={exportThemeColors}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Export Theme
          </Button>
          <Button 
            onClick={applyThemeColors}
            className="gap-2"
          >
            <Paintbrush className="h-4 w-4" />
            Apply Theme Colors
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
