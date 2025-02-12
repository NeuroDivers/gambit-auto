import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { ColorSettings, THEME_PRESETS, getSystemThemePreference } from "./types"

// Convert hex to HSL color format
const hexToHSL = (hex: string): string => {
  // Remove the # if present
  hex = hex.replace('#', '')
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    
    h /= 6
  }
  
  // Convert to degrees and percentages
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)
  
  return `${h} ${s}% ${l}%`
}

const applyColorStyles = (colors: ColorSettings) => {
  const root = document.documentElement
  
  // Apply the theme mode
  if (colors.theme_mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  
  // Convert and apply colors as HSL values
  root.style.setProperty('--background', hexToHSL(colors.background))
  root.style.setProperty('--foreground', hexToHSL(colors.foreground))
  root.style.setProperty('--primary', hexToHSL(colors.primary_color))
  root.style.setProperty('--primary-foreground', colors.theme_mode === 'dark' ? '0 0% 98%' : '0 0% 100%')
  root.style.setProperty('--accent', hexToHSL(colors.accent_color))
  root.style.setProperty('--accent-foreground', colors.theme_mode === 'dark' ? '0 0% 98%' : '240 5.9% 10%')
  
  // Set complementary variables
  if (colors.theme_mode === 'dark') {
    root.style.setProperty('--card', '240 10% 3.9%')
    root.style.setProperty('--card-foreground', '0 0% 98%')
    root.style.setProperty('--popover', '240 10% 3.9%')
    root.style.setProperty('--popover-foreground', '0 0% 98%')
    root.style.setProperty('--secondary', '240 3.7% 15.9%')
    root.style.setProperty('--secondary-foreground', '0 0% 98%')
    root.style.setProperty('--muted', '240 3.7% 15.9%')
    root.style.setProperty('--muted-foreground', '240 5% 64.9%')
    root.style.setProperty('--destructive', '0 62.8% 30.6%')
    root.style.setProperty('--destructive-foreground', '0 0% 98%')
    root.style.setProperty('--border', '240 3.7% 15.9%')
    root.style.setProperty('--input', '240 3.7% 15.9%')
    root.style.setProperty('--ring', '240 4.9% 83.9%')
    
    // Dark mode sidebar colors
    root.style.setProperty('--sidebar-background', '240 10% 3.9%')
    root.style.setProperty('--sidebar-foreground', '0 0% 98%')
    root.style.setProperty('--sidebar-primary', hexToHSL(colors.primary_color))
    root.style.setProperty('--sidebar-primary-foreground', '0 0% 98%')
    root.style.setProperty('--sidebar-accent', hexToHSL(colors.accent_color))
    root.style.setProperty('--sidebar-accent-foreground', '0 0% 98%')
    root.style.setProperty('--sidebar-border', '240 3.7% 15.9%')
    root.style.setProperty('--sidebar-ring', '240 4.9% 83.9%')
  } else {
    root.style.setProperty('--card', '0 0% 100%')
    root.style.setProperty('--card-foreground', '240 10% 3.9%')
    root.style.setProperty('--popover', '0 0% 100%')
    root.style.setProperty('--popover-foreground', '240 10% 3.9%')
    root.style.setProperty('--secondary', '240 4.8% 95.9%')
    root.style.setProperty('--secondary-foreground', '240 5.9% 10%')
    root.style.setProperty('--muted', '240 4.8% 95.9%')
    root.style.setProperty('--muted-foreground', '240 3.8% 46.1%')
    root.style.setProperty('--destructive', '0 84.2% 60.2%')
    root.style.setProperty('--destructive-foreground', '0 0% 98%')
    root.style.setProperty('--border', '240 5.9% 90%')
    root.style.setProperty('--input', '240 5.9% 90%')
    root.style.setProperty('--ring', '240 5.9% 10%')
    
    // Light mode sidebar colors
    root.style.setProperty('--sidebar-background', '0 0% 100%')
    root.style.setProperty('--sidebar-foreground', '240 10% 3.9%')
    root.style.setProperty('--sidebar-primary', hexToHSL(colors.primary_color))
    root.style.setProperty('--sidebar-primary-foreground', '240 5.9% 10%')
    root.style.setProperty('--sidebar-accent', hexToHSL(colors.accent_color))
    root.style.setProperty('--sidebar-accent-foreground', '240 5.9% 10%')
    root.style.setProperty('--sidebar-border', '240 5.9% 90%')
    root.style.setProperty('--sidebar-ring', '240 5.9% 10%')
  }
}

export function useColorManagement() {
  const [colors, setColors] = useState<ColorSettings>(() => {
    const systemTheme = getSystemThemePreference()
    return {
      ...THEME_PRESETS[systemTheme],
      theme_mode: systemTheme
    }
  })

  const { data: siteColors, refetch } = useQuery({
    queryKey: ["site-colors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_colors")
        .select("*")
        .limit(1)
        .single()

      if (error) throw error
      return data
    }
  })

  // Apply colors whenever they change
  useEffect(() => {
    applyColorStyles(colors)
  }, [colors])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!siteColors) {
        const newTheme = e.matches ? 'dark' : 'light'
        setColors(prev => ({
          ...prev,
          ...THEME_PRESETS[newTheme],
          theme_mode: newTheme
        }))
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [siteColors])

  useEffect(() => {
    if (siteColors) {
      setColors({
        background: siteColors.background,
        foreground: siteColors.foreground,
        primary_color: siteColors.primary_color,
        primary_hover: siteColors.primary_hover,
        accent_color: siteColors.accent_color,
        accent_hover: siteColors.accent_hover,
        theme_mode: siteColors.theme_mode
      })
    }
  }, [siteColors])

  const handleColorChange = (key: keyof ColorSettings, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setColors(prev => ({
      ...prev,
      ...THEME_PRESETS[theme],
      theme_mode: theme
    }))
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("site_colors")
        .upsert({
          id: siteColors?.id,
          ...colors,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success("Color settings updated successfully")
      refetch()
    } catch (error) {
      console.error('Error updating color settings:', error)
      toast.error("Failed to update color settings")
    }
  }

  return {
    colors,
    handleColorChange,
    handleThemeChange,
    handleSave
  }
}
