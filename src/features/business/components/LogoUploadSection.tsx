
import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormDescription } from "@/components/ui/form"
import { Image, Loader2 } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { BusinessFormValues } from "../schemas/businessFormSchema"

interface LogoUploadSectionProps {
  form: UseFormReturn<BusinessFormValues>
  isUploading: boolean
  logoPreview: string | null
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
}

export function LogoUploadSection({
  form,
  isUploading,
  logoPreview,
  onFileUpload
}: LogoUploadSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Image className="h-4 w-4 text-[#9b87f5]" />
          Business Logo
        </Label>
        <FormDescription>
          Upload your business logo
        </FormDescription>
        
        <div className="space-y-3">
          <div className="flex flex-col gap-4">
            {logoPreview && (
              <div className="relative w-32 h-32 bg-background rounded-lg border p-2">
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={onFileUpload}
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
