
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorSettings } from "./types"

interface ColorInputProps {
  label: string
  value: string
  name: keyof ColorSettings
  onChange: (name: keyof ColorSettings, value: string) => void
}

export function ColorInput({ label, value, name, onChange }: ColorInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-16 h-10 p-1"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="font-mono"
        />
        <div 
          className="w-10 h-10 rounded border"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  )
}
