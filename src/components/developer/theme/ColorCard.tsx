
import React from "react";
import { Input } from "@/components/ui/input";
import { ColorVariable, ThemeMode } from "./types";
import { ColorPicker } from "./ColorPicker";
import { hslToHex } from "./colorUtils";

interface ColorCardProps {
  variable: ColorVariable;
  themeMode: ThemeMode;
  colors: Record<string, string>;
  handleColorChange: (theme: ThemeMode, name: string, value: string) => void;
  handleColorPickerChange: (theme: ThemeMode, name: string, hex: string) => void;
  handleHexInputChange: (theme: ThemeMode, name: string, hex: string) => void;
  activeColorName: string | null;
  setActiveColorName: (name: string | null) => void;
}

export function ColorCard({
  variable,
  themeMode,
  colors,
  handleColorChange,
  handleColorPickerChange,
  handleHexInputChange,
  activeColorName,
  setActiveColorName
}: ColorCardProps) {
  const hslValue = colors[variable.name] || (themeMode === 'light' ? variable.defaultLight : variable.defaultDark);
  const hexValue = hslToHex(hslValue);
  
  return (
    <div className="bg-card rounded-lg border p-4 space-y-3 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">{variable.name}</h3>
          <p className="text-xs text-muted-foreground">{variable.description}</p>
        </div>
        <div 
          className="h-6 w-6 rounded-full border" 
          style={{ background: `hsl(${hslValue})` }} 
        />
      </div>
      
      <div className="grid gap-2">
        <div className="flex gap-2 items-center">
          <Input 
            id={`${themeMode}-${variable.name}`} 
            value={hslValue} 
            onChange={e => handleColorChange(themeMode, variable.name, e.target.value)} 
            placeholder={themeMode === 'light' ? variable.defaultLight : variable.defaultDark} 
            className="flex-1 h-8 text-xs" 
          />
          <ColorPicker 
            name={variable.name} 
            value={hslValue} 
            onChange={hex => handleColorPickerChange(themeMode, variable.name, hex)} 
            theme={themeMode}
            activeColorName={activeColorName}
            setActiveColorName={setActiveColorName}
          />
        </div>
        
        <div className="flex items-center">
          <Input 
            value={hexValue} 
            onChange={e => handleHexInputChange(themeMode, variable.name, e.target.value)} 
            className="h-7 text-xs font-mono w-full" 
            placeholder="Hex color" 
            type="text"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}
