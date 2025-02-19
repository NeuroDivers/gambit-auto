
import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"
import { Image, Loader2, Sun, Moon } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { BusinessFormValues } from "../schemas/businessFormSchema"

interface LogoUploadSectionProps {
  form: UseFormReturn<BusinessFormValues>
  isUploading: boolean
  lightLogoPreview: string | null
  darkLogoPreview: string | null
  onFileUpload: (type: 'light' | 'dark') => (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
}

export function LogoUploadSection({
  form,
  isUploading,
  lightLogoPreview,
  darkLogoPreview,
  onFileUpload
}: LogoUploadSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Image className="h-4 w-4 text-[#9b87f5]" />
          Business Logos
        </Label>
        <FormDescription>
          Upload your business logos for light and dark modes
        </FormDescription>
        
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Light Logo Section */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light Mode Logo
            </Label>
            <div className="space-y-3">
              {lightLogoPreview && (
                <div className="relative w-32 h-32 bg-white rounded-lg border p-2">
                  <img 
                    src={lightLogoPreview} 
                    alt="Light Logo Preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={onFileUpload('light')}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Dark Logo Section */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dark Mode Logo
            </Label>
            <div className="space-y-3">
              {darkLogoPreview && (
                <div className="relative w-32 h-32 bg-zinc-900 rounded-lg border p-2">
                  <img 
                    src={darkLogoPreview} 
                    alt="Dark Logo Preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={onFileUpload('dark')}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  )
}
