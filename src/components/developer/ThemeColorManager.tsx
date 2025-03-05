
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
  EyeDropper
} from "lucide-react"
import { toast } from "sonner"
import { applyThemeClass } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorVariable {
  name: string;
  description: string;
  defaultLight: string;
  defaultDark: string;
}

const themeColorVariables: ColorVariable[] = [
  { name: "background", description: "Main background color", defaultLight: "0 0% 100%", defaultDark: "222 47% 11%" },
  { name: "foreground", description: "Main text color", defaultLight: "240 10% 3.9%", defaultDark: "210 40% 98%" },
  { name: "card", description: "Card background color", defaultLight: "0 0% 100%", defaultDark: "222 47% 14%" },
  { name: "card-foreground", description: "Card text color", defaultLight: "240 10% 3.9%", defaultDark: "210 40% 98%" },
  { name: "primary", description: "Primary action color", defaultLight: "262 83.3% 57.8%", defaultDark: "262 83.3% 70%" },
  { name: "primary-foreground", description: "Text on primary color", defaultLight: "0 0% 100%", defaultDark: "0 0% 100%" },
  { name: "secondary", description: "Secondary color", defaultLight: "240 4.8% 95.9%", defaultDark: "217 32% 20%" },
  { name: "secondary-foreground", description: "Text on secondary color", defaultLight: "240 5.9% 10%", defaultDark: "210 40% 98%" },
  { name: "muted", description: "Muted background color", defaultLight: "240 4.8% 95.9%", defaultDark: "217 32% 20%" },
  { name: "muted-foreground", description: "Muted text color", defaultLight: "240 3.8% 46.1%", defaultDark: "215 20% 65%" },
  { name: "accent", description: "Accent color", defaultLight: "262 83.3% 57.8%", defaultDark: "262 83.3% 25%" },
  { name: "accent-foreground", description: "Text on accent color", defaultLight: "0 0% 100%", defaultDark: "210 40% 98%" },
  { name: "destructive", description: "Destructive action color", defaultLight: "0 84.2% 60.2%", defaultDark: "0 62.8% 30.6%" },
  { name: "destructive-foreground", description: "Text on destructive color", defaultLight: "0 0% 98%", defaultDark: "210 40% 98%" },
  { name: "border", description: "Border color", defaultLight: "240 5.9% 90%", defaultDark: "217 32% 25%" },
  { name: "input", description: "Input border color", defaultLight: "240 5.9% 90%", defaultDark: "217 32% 25%" },
  { name: "ring", description: "Focus ring color", defaultLight: "262 83.3% 57.8%", defaultDark: "262 83.3% 70%" },
];

// Convert HSL (in format "H S% L%") to hex color
function hslToHex(hslString: string): string {
  // Parse HSL values
  const [h, s, l] = hslString.split(' ').map(val => parseFloat(val.replace('%', '')));
  
  // Convert HSL to RGB
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
  
  // Convert to hex
  const toHex = (n: number): string => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert hex color to HSL (in format "H S% L%")
function hexToHsl(hex: string): string {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
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
  
  useEffect(() => {
    // Load current CSS variables
    loadCurrentThemeColors()
  }, [])
  
  // Load current theme colors from CSS variables
  const loadCurrentThemeColors = () => {
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)
    
    const lightThemeColors: Record<string, string> = {}
    const darkThemeColors: Record<string, string> = {}
    
    themeColorVariables.forEach(variable => {
      // Extract light theme colors
      const lightValue = computedStyle.getPropertyValue(`--${variable.name}`).trim()
      lightThemeColors[variable.name] = lightValue || variable.defaultLight
      
      // For dark theme, we need to temporarily add the dark class to get values
      root.classList.add('dark')
      const darkValue = computedStyle.getPropertyValue(`--${variable.name}`).trim()
      darkThemeColors[variable.name] = darkValue || variable.defaultDark
      root.classList.remove('dark')
    })
    
    setLightColors(lightThemeColors)
    setDarkColors(darkThemeColors)
    
    // Re-apply the current theme
    applyThemeClass(theme, resolvedTheme)
  }
  
  const handleColorChange = (theme: 'light' | 'dark', name: string, value: string) => {
    if (theme === 'light') {
      setLightColors(prev => ({ ...prev, [name]: value }))
    } else {
      setDarkColors(prev => ({ ...prev, [name]: value }))
    }
  }

  // Handle color picker change
  const handleColorPickerChange = (theme: 'light' | 'dark', name: string, hex: string) => {
    const hslValue = hexToHsl(hex);
    handleColorChange(theme, name, hslValue);
  }
  
  const applyThemeColors = () => {
    const root = document.documentElement
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
    
    // Remove existing style element if it exists
    const existingStyle = document.getElementById('theme-colors-style')
    if (existingStyle) {
      existingStyle.remove()
    }
    
    // Add the new style element
    style.id = 'theme-colors-style'
    document.head.appendChild(style)
    
    // Apply current theme
    applyThemeClass(theme, resolvedTheme)
    
    toast.success("Theme colors applied successfully")
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
    value, 
    onChange 
  }: { 
    value: string, 
    onChange: (hex: string) => void 
  }) => {
    const hexColor = hslToHex(value);
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-10 h-10 p-0 border-2"
            style={{ backgroundColor: hexColor }}
          >
            <span className="sr-only">Pick a color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Pick a color</h4>
              <input
                type="color"
                value={hexColor}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10"
              />
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
                      value={lightColors[variable.name] || variable.defaultLight}
                      onChange={(hex) => handleColorPickerChange('light', variable.name, hex)}
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
                      value={darkColors[variable.name] || variable.defaultDark}
                      onChange={(hex) => handleColorPickerChange('dark', variable.name, hex)}
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
            Apply Theme Colors
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
