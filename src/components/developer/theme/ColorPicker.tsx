
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { ThemeMode } from "./types";
import { hslToHex } from "./colorUtils";

interface ColorPickerProps {
  name: string;
  value: string;
  onChange: (hex: string) => void;
  theme: ThemeMode;
  activeColorName: string | null;
  setActiveColorName: (name: string | null) => void;
}

export function ColorPicker({
  name,
  value,
  onChange,
  theme,
  activeColorName,
  setActiveColorName
}: ColorPickerProps) {
  const hexColor = hslToHex(value);
  const isOpen = activeColorName === `${theme}-${name}`;
  
  return (
    <Popover 
      open={isOpen} 
      onOpenChange={open => {
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
      >
        <div 
          className="p-3" 
          onClick={e => e.stopPropagation()} 
          onMouseDown={e => e.stopPropagation()}
        >
          <HexColorPicker 
            color={hexColor} 
            onChange={onChange} 
            onMouseDown={e => e.stopPropagation()} 
          />
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex justify-between items-center">
              <Label>Hex</Label>
              <Input 
                value={hexColor} 
                onChange={e => onChange(e.target.value)} 
                className="w-24 font-mono" 
                onClick={e => e.stopPropagation()} 
                onMouseDown={e => e.stopPropagation()} 
                onKeyDown={e => e.stopPropagation()} 
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
}
