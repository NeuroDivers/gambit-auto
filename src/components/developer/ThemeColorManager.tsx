import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Import our utility
import { applyThemeClass } from "@/utils/themeUtils";

export function ThemeColorManager() {
  const [selectedTheme, setSelectedTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'system';
    } catch (error) {
      console.error('Could not load theme preference', error);
      return 'system';
    }
  });

  useEffect(() => {
    applyThemeClass(selectedTheme);
  }, [selectedTheme]);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Theme
        </Label>
      </div>
      <RadioGroup defaultValue={selectedTheme} className="flex" onValueChange={handleThemeChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="light" id="light" />
          <Label htmlFor="light">Light</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="dark" id="dark" />
          <Label htmlFor="dark">Dark</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="system" id="system" />
          <Label htmlFor="system">System</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
