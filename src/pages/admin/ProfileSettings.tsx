
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Sun, Moon, Laptop } from "lucide-react";

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

  // Force theme application immediately
  useEffect(() => {
    if (!mounted) return;
    
    // Immediately toggle the dark class on the html element
    if (theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark')) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Log theme state for debugging
    console.log({
      selectedTheme: theme,
      resolvedTheme,
      currentSystemTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      documentClassList: document.documentElement.classList.contains('dark') ? 'has dark class' : 'no dark class'
    });
    
  }, [theme, resolvedTheme, mounted]);

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast.success(`Theme changed to ${value === 'system' ? 'system default' : value} mode`);

    // Apply dark class immediately to avoid flicker
    if (value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Log theme state for debugging
    console.log({
      selectedTheme: value,
      resolvedTheme,
      currentSystemTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      documentClassList: document.documentElement.classList.contains('dark') ? 'has dark class' : 'no dark class'
    });
  };

  // Don't render anything until after mounting to prevent hydration mismatch
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
              Choose your preferred theme for the application
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
                  id="theme-light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="h-6 w-6 mb-2" />
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="dark" 
                  id="theme-dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="h-6 w-6 mb-2" />
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem 
                  value="system" 
                  id="theme-system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="theme-system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Laptop className="h-6 w-6 mb-2" />
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
