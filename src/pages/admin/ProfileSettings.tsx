
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function ProfileSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Set initial theme to system if not set
    if (!theme) {
      setTheme('system');
    }
  }, [theme, setTheme]);

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast.success(`Theme changed to ${value === 'system' ? 'system default' : value} mode`);

    // Log theme state for debugging
    console.log({
      selectedTheme: value,
      resolvedTheme,
      currentSystemTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    });
  };

  // Check the actual theme being applied
  const currentTheme = resolvedTheme || theme;

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Preferences</CardTitle>
            <CardDescription>
              Current theme: {theme === 'system' ? `System (${currentTheme})` : theme}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={theme} 
              onValueChange={handleThemeChange}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem 
                  value="light" 
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${currentTheme === 'light' ? 'border-primary' : ''}`}
                >
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="dark" 
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${currentTheme === 'dark' ? 'border-primary' : ''}`}
                >
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="system" 
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${theme === 'system' ? 'border-primary' : ''}`}
                >
                  System
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <ProfileForm />
      </div>
    </div>
  );
}
