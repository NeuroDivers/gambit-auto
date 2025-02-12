
export type ColorSettings = {
  background: string
  foreground: string
  primary_color: string
  primary_hover: string
  accent_color: string
  accent_hover: string
  theme_mode: 'light' | 'dark'
}

export const THEME_PRESETS = {
  light: {
    background: '#FFFFFF',
    foreground: '#000000',
    primary_color: '#6366F1',
    primary_hover: '#4F46E5',
    accent_color: '#8B5CF6',
    accent_hover: '#7C3AED'
  },
  dark: {
    background: '#121212',
    foreground: '#FFFFFF',
    primary_color: '#9b87f5',
    primary_hover: '#7E69AB',
    accent_color: '#D6BCFA',
    accent_hover: '#6E59A5'
  }
}

export const getSystemThemePreference = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
