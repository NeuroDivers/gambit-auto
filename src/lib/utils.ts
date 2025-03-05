
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
  // First try to use the explicitly set theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    return;
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
    return;
  }
  
  // If theme is system or undefined, use the resolved theme
  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // If no theme info is available, check localStorage directly
  if (!theme && !resolvedTheme) {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Fall back to system preference
      if (getSystemTheme() === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
