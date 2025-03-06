
export interface ColorVariable {
  name: string;
  description: string;
  defaultLight: string;
  defaultDark: string;
  category: "base" | "components" | "states" | "avatar" | "text" | "tabs" | "toast" | "status" | "invoice" | "estimate";
}

export const LOCAL_STORAGE_KEY = "custom-theme-colors";

export type ThemeMode = 'light' | 'dark';
