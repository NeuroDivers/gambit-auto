
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ColorSettings = {
  background: string
  foreground: string
  primary_color: string
  primary_hover: string
  accent_color: string
  accent_hover: string
}

export function ColorManagementSection() {
  const [colors, setColors] = useState<ColorSettings>({
    background: '#121212',
    foreground: '#FFFFFF',
    primary_color: '#9b87f5',
    primary_hover: '#7E69AB',
    accent_color: '#D6BCFA',
    accent_hover: '#6E59A5'
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
    },
    onSuccess: (data) => {
      if (data) {
        setColors({
          background: data.background,
          foreground: data.foreground,
          primary_color: data.primary_color,
          primary_hover: data.primary_hover,
          accent_color: data.accent_color,
          accent_hover: data.accent_hover
        })
      }
    }
  })

  const handleColorChange = (key: keyof ColorSettings, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
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

  const ColorInput = ({ label, value, name }: { label: string; value: string; name: keyof ColorSettings }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => handleColorChange(name, e.target.value)}
          className="w-16 h-10 p-1"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => handleColorChange(name, e.target.value)}
          className="font-mono"
        />
        <div 
          className="w-10 h-10 rounded border"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Colors</CardTitle>
        <CardDescription>
          Customize the appearance of your site by adjusting these colors.
          Changes will affect the entire application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-4">
            <h3 className="font-medium">Theme Colors</h3>
            <div className="grid gap-4">
              <ColorInput label="Background" value={colors.background} name="background" />
              <ColorInput label="Foreground" value={colors.foreground} name="foreground" />
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="font-medium">Primary Colors</h3>
            <div className="grid gap-4">
              <ColorInput label="Primary" value={colors.primary_color} name="primary_color" />
              <ColorInput label="Primary Hover" value={colors.primary_hover} name="primary_hover" />
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="font-medium">Accent Colors</h3>
            <div className="grid gap-4">
              <ColorInput label="Accent" value={colors.accent_color} name="accent_color" />
              <ColorInput label="Accent Hover" value={colors.accent_hover} name="accent_hover" />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Color Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
