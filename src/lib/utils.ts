
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

export const getSystemTheme = (): "dark" | "light" => {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  
  // Default to light if we can't detect
  return "light"
}

export const applyThemeClass = (theme: string | undefined, resolvedTheme: string | undefined): void => {
  // First try to use the explicitly set theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  let themeToApply = theme;
  
  // If theme is not explicitly set in the component, check localStorage
  if (!themeToApply && savedTheme) {
    themeToApply = savedTheme;
    console.log("Using theme from localStorage:", themeToApply);
  }
  
  // Apply theme based on our determined value
  if (themeToApply === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    console.log("Applied dark theme");
    return;
  } else if (themeToApply === 'light') {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    console.log("Applied light theme");
    return;
  } else if (themeToApply === 'system') {
    localStorage.setItem('theme', 'system');
    console.log("Set theme to system preference");
  }
  
  // If theme is system or undefined, use the resolved theme
  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    console.log("Applied dark theme from resolved theme");
  } else if (resolvedTheme === 'light') {
    document.documentElement.classList.remove('dark');
    console.log("Applied light theme from resolved theme");
  }
  
  // If no theme info is available, check localStorage directly as a fallback
  if (!themeToApply && !resolvedTheme) {
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log("Applied dark theme from localStorage fallback");
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      console.log("Applied light theme from localStorage fallback");
    } else {
      // Fall back to system preference
      if (getSystemTheme() === 'dark') {
        document.documentElement.classList.add('dark');
        console.log("Applied dark theme from system preference");
      } else {
        document.documentElement.classList.remove('dark');
        console.log("Applied light theme from system preference");
      }
    }
  }
  
  // Apply any custom theme colors
  applyCustomThemeColors();
}

export const applyCustomThemeColors = (): void => {
  const customThemeColors = localStorage.getItem("custom-theme-colors");
  if (customThemeColors) {
    // Only apply theme colors if they don't already exist
    if (!document.getElementById('theme-colors-style')) {
      try {
        const { light, dark } = JSON.parse(customThemeColors);
        
        const style = document.createElement('style');
        let cssText = `:root {\n`;
        Object.entries(light).forEach(([name, value]) => {
          cssText += `  --${name}: ${value};\n`;
        });
        cssText += `}\n\n`;
        
        cssText += `.dark {\n`;
        Object.entries(dark).forEach(([name, value]) => {
          cssText += `  --${name}: ${value};\n`;
        });
        cssText += `}\n`;
        
        style.textContent = cssText;
        style.id = 'theme-colors-style';
        document.head.appendChild(style);
      } catch (error) {
        console.error("Error applying saved theme colors:", error);
      }
    }
  }
}
