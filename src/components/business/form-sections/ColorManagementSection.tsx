
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ColorInput } from "./color-management/ColorInput"
import { ThemeSelector } from "./color-management/ThemeSelector"
import { useColorManagement } from "./color-management/useColorManagement"

export function ColorManagementSection() {
  const { colors, handleColorChange, handleThemeChange, handleSave } = useColorManagement()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Colors</CardTitle>
        <CardDescription>
          Customize the appearance of your site by adjusting these colors.
          Changes will affect the entire application. The initial theme matches your system preference.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <ThemeSelector 
            value={colors.theme_mode} 
            onChange={handleThemeChange} 
          />

          <div className="grid gap-4">
            <h3 className="font-medium">Theme Colors</h3>
            <div className="grid gap-4">
              <ColorInput 
                label="Background" 
                value={colors.background} 
                name="background" 
                onChange={handleColorChange}
              />
              <ColorInput 
                label="Foreground" 
                value={colors.foreground} 
                name="foreground" 
                onChange={handleColorChange}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="font-medium">Primary Colors</h3>
            <div className="grid gap-4">
              <ColorInput 
                label="Primary" 
                value={colors.primary_color} 
                name="primary_color" 
                onChange={handleColorChange}
              />
              <ColorInput 
                label="Primary Hover" 
                value={colors.primary_hover} 
                name="primary_hover" 
                onChange={handleColorChange}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="font-medium">Accent Colors</h3>
            <div className="grid gap-4">
              <ColorInput 
                label="Accent" 
                value={colors.accent_color} 
                name="accent_color" 
                onChange={handleColorChange}
              />
              <ColorInput 
                label="Accent Hover" 
                value={colors.accent_hover} 
                name="accent_hover" 
                onChange={handleColorChange}
              />
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
