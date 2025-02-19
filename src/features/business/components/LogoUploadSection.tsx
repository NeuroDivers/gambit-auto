
import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Image, Loader2, Sun, Moon } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { BusinessFormValues } from "../schemas/businessFormSchema"

interface LogoUploadSectionProps {
  form: UseFormReturn<BusinessFormValues>
  isUploading: boolean
  lightLogoPreview: string | null
  darkLogoPreview: string | null
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, logoType: 'light' | 'dark') => Promise<void>
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
        
        {/* Light Logo Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sun className="h-4 w-4" />
            Light Mode Logo
          </Label>
          <div className="flex flex-col gap-4">
            {lightLogoPreview && (
              <div className="relative w-32 h-32 bg-background rounded-lg border p-2">
                <img 
                  src={lightLogoPreview} 
                  alt="Light Logo Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => onFileUpload(e, 'light')}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Dark Logo Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Moon className="h-4 w-4" />
            Dark Mode Logo
          </Label>
          <div className="flex flex-col gap-4">
            {darkLogoPreview && (
              <div className="relative w-32 h-32 bg-zinc-900 rounded-lg border p-2">
                <img 
                  src={darkLogoPreview} 
                  alt="Dark Logo Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => onFileUpload(e, 'dark')}
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
