
import { ColorVariable, LOCAL_STORAGE_KEY } from "./types";

export const themeColorVariables: ColorVariable[] = [
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
// Toast colors
{
  name: "toast-background",
  description: "Toast notification background",
  defaultLight: "0 0% 100%",
  defaultDark: "260 15% 11%",
  category: "toast"
}, {
  name: "toast-foreground",
  description: "Toast notification text",
  defaultLight: "240 10% 3.9%",
  defaultDark: "210 40% 98%",
  category: "toast"
}, {
  name: "toast-border",
  description: "Toast notification border",
  defaultLight: "240 5.9% 90%",
  defaultDark: "260 15% 22%",
  category: "toast"
}, {
  name: "toast-action",
  description: "Toast action button",
  defaultLight: "240 4.8% 95.9%",
  defaultDark: "260 15% 18%",
  category: "toast"
}, {
  name: "toast-destructive",
  description: "Destructive toast background",
  defaultLight: "0 84.2% 60.2%",
  defaultDark: "0 62.8% 40.6%",
  category: "toast"
}, {
  name: "toast-destructive-foreground",
  description: "Destructive toast text",
  defaultLight: "0 0% 98%",
  defaultDark: "210 40% 98%",
  category: "toast"
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

export function applyCustomThemeColors(lightColors: Record<string, string>, darkColors: Record<string, string>) {
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

export const getDefaultColors = (mode: 'light' | 'dark') => {
  return themeColorVariables.reduce((acc, variable) => {
    acc[variable.name] = mode === 'light' ? variable.defaultLight : variable.defaultDark;
    return acc;
  }, {} as Record<string, string>);
};
