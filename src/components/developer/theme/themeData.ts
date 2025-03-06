
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
// Avatar colors - changed category to "avatar"
{
  name: "avatar-background",
  description: "Avatar background color",
  defaultLight: "280 60% 95%",
  defaultDark: "280 40% 35%",
  category: "avatar"
}, {
  name: "avatar-foreground",
  description: "Avatar text color",
  defaultLight: "280 30% 40%",
  defaultDark: "280 30% 90%",
  category: "avatar"
}, {
  name: "avatar-active-background",
  description: "Active avatar background",
  defaultLight: "262 83.3% 57.8%",
  defaultDark: "262 83.3% 75%",
  category: "avatar"
}, {
  name: "avatar-active-foreground",
  description: "Active avatar text color",
  defaultLight: "0 0% 100%",
  defaultDark: "0 0% 100%",
  category: "avatar"
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
// Status badge colors
{
  name: "status-pending-bg",
  description: "Pending badge background",
  defaultLight: "48 96% 89%", // Yellow background
  defaultDark: "48 70% 45%",
  category: "status"
}, {
  name: "status-pending-text",
  description: "Pending badge text",
  defaultLight: "36 40% 30%", // Darker yellow text
  defaultDark: "48 100% 96%",
  category: "status"
}, {
  name: "status-in-progress-bg",
  description: "In Progress badge background",
  defaultLight: "220 83% 92%", // Blue background
  defaultDark: "220 70% 46%",
  category: "status"
}, {
  name: "status-in-progress-text",
  description: "In Progress badge text",
  defaultLight: "220 70% 30%", // Darker blue text
  defaultDark: "220 100% 96%",
  category: "status"
}, {
  name: "status-completed-bg",
  description: "Completed badge background",
  defaultLight: "142 76% 90%", // Green background
  defaultDark: "142 70% 45%",
  category: "status"
}, {
  name: "status-completed-text",
  description: "Completed badge text",
  defaultLight: "142 70% 30%", // Darker green text
  defaultDark: "142 100% 96%",
  category: "status"
}, {
  name: "status-cancelled-bg",
  description: "Cancelled badge background",
  defaultLight: "0 84% 95%", // Red background
  defaultDark: "0 70% 45%",
  category: "status"
}, {
  name: "status-cancelled-text",
  description: "Cancelled badge text",
  defaultLight: "0 70% 40%", // Darker red text
  defaultDark: "0 100% 96%",
  category: "status"
}, {
  name: "status-invoiced-bg",
  description: "Invoiced badge background",
  defaultLight: "270 76% 94%", // Purple background
  defaultDark: "270 70% 60%",
  category: "status"
}, {
  name: "status-invoiced-text",
  description: "Invoiced badge text",
  defaultLight: "270 70% 45%", // Darker purple text
  defaultDark: "270 100% 96%",
  category: "status"
},
// Invoice status colors
{
  name: "invoice-draft-bg",
  description: "Draft invoice background",
  defaultLight: "240 10% 94%", // Light gray background
  defaultDark: "240 10% 36%",
  category: "invoice"
}, {
  name: "invoice-draft-text",
  description: "Draft invoice text",
  defaultLight: "240 10% 40%", // Darker gray text
  defaultDark: "240 10% 92%",
  category: "invoice"
}, {
  name: "invoice-sent-bg",
  description: "Sent invoice background",
  defaultLight: "270 76% 94%", // Purple background
  defaultDark: "270 70% 60%",
  category: "invoice"
}, {
  name: "invoice-sent-text",
  description: "Sent invoice text",
  defaultLight: "270 70% 45%", // Darker purple text
  defaultDark: "270 100% 96%",
  category: "invoice"
}, {
  name: "invoice-paid-bg",
  description: "Paid invoice background",
  defaultLight: "142 76% 90%", // Green background
  defaultDark: "142 70% 45%",
  category: "invoice"
}, {
  name: "invoice-paid-text",
  description: "Paid invoice text",
  defaultLight: "142 70% 30%", // Darker green text
  defaultDark: "142 100% 96%",
  category: "invoice"
}, {
  name: "invoice-overdue-bg",
  description: "Overdue invoice background",
  defaultLight: "0 84% 95%", // Red background
  defaultDark: "0 70% 45%",
  category: "invoice"
}, {
  name: "invoice-overdue-text",
  description: "Overdue invoice text",
  defaultLight: "0 70% 40%", // Darker red text
  defaultDark: "0 100% 96%",
  category: "invoice"
},
// Estimate status colors
{
  name: "estimate-pending-bg",
  description: "Pending estimate background",
  defaultLight: "48 96% 89%", // Yellow background
  defaultDark: "48 70% 45%",
  category: "estimate"
}, {
  name: "estimate-pending-text",
  description: "Pending estimate text",
  defaultLight: "36 40% 30%", // Darker yellow text
  defaultDark: "48 100% 96%",
  category: "estimate"
}, {
  name: "estimate-accepted-bg",
  description: "Accepted estimate background",
  defaultLight: "142 76% 90%", // Green background
  defaultDark: "142 70% 45%",
  category: "estimate"
}, {
  name: "estimate-accepted-text",
  description: "Accepted estimate text",
  defaultLight: "142 70% 30%", // Darker green text
  defaultDark: "142 100% 96%",
  category: "estimate"
}, {
  name: "estimate-rejected-bg",
  description: "Rejected estimate background",
  defaultLight: "0 84% 95%", // Red background
  defaultDark: "0 70% 45%",
  category: "estimate"
}, {
  name: "estimate-rejected-text",
  description: "Rejected estimate text",
  defaultLight: "0 70% 40%", // Darker red text
  defaultDark: "0 100% 96%",
  category: "estimate"
}, {
  name: "estimate-expired-bg",
  description: "Expired estimate background",
  defaultLight: "240 10% 94%", // Gray background
  defaultDark: "240 10% 40%",
  category: "estimate"
}, {
  name: "estimate-expired-text",
  description: "Expired estimate text",
  defaultLight: "240 10% 40%", // Gray text
  defaultDark: "240 10% 92%",
  category: "estimate"
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
