
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { ColorSettings, THEME_PRESETS, getSystemThemePreference } from "./types"

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
