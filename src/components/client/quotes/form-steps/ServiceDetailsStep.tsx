
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { QuoteRequestFormData } from "./types"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ServiceDetailsStepProps = {
  form: UseFormReturn<QuoteRequestFormData>
  services: any[]
  serviceId: string
  onImageUpload: (files: FileList, serviceId: string) => Promise<void>
  onImageRemove: (url: string, serviceId: string) => void
}

export function ServiceDetailsStep({ 
  form, 
  services, 
  serviceId,
  onImageUpload,
  onImageRemove
}: ServiceDetailsStepProps) {
  const service = services.find(s => s.id === serviceId)
  if (!service) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await onImageUpload(e.target.files, serviceId)
    }
  }

  const serviceDetails = form.watch('service_details')[serviceId] || {}
  const images = (serviceDetails.images || []) as string[]

  const renderServiceSpecificFields = () => {
    switch (service.name.toLowerCase()) {
      case 'ppf':
        return (
          <FormField
            control={form.control}
            name={`service_details.${serviceId}.package_type`}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Package Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="partial_front" id={`${serviceId}-partial_front`} />
                      <Label htmlFor={`${serviceId}-partial_front`}>Partial Front</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="full_front" id={`${serviceId}-full_front`} />
                      <Label htmlFor={`${serviceId}-full_front`}>Full Front</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="track_pack" id={`${serviceId}-track_pack`} />
                      <Label htmlFor={`${serviceId}-track_pack`}>Track Pack</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="full_vehicle" id={`${serviceId}-full_vehicle`} />
                      <Label htmlFor={`${serviceId}-full_vehicle`}>Full Vehicle</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      
      case 'window tint':
        return (
          <FormField
            control={form.control}
            name={`service_details.${serviceId}.tint_type`}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tint Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="two_front" id={`${serviceId}-two_front`} />
                      <Label htmlFor={`${serviceId}-two_front`}>2 Front Windows</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="front_and_rear" id={`${serviceId}-front_and_rear`} />
                      <Label htmlFor={`${serviceId}-front_and_rear`}>Front and Rear Windows</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="complete" id={`${serviceId}-complete`} />
                      <Label htmlFor={`${serviceId}-complete`}>Complete</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      
      case 'auto detailing':
        return (
          <FormField
            control={form.control}
            name={`service_details.${serviceId}.detail_type`}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Detail Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="interior" id={`${serviceId}-interior`} />
                      <Label htmlFor={`${serviceId}-interior`}>Interior</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="exterior" id={`${serviceId}-exterior`} />
                      <Label htmlFor={`${serviceId}-exterior`}>Exterior</Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0">
                      <RadioGroupItem value="both" id={`${serviceId}-both`} />
                      <Label htmlFor={`${serviceId}-both`}>Both Interior & Exterior</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      
      case 'wrap':
        return (
          <div className="text-center p-4 bg-muted rounded-lg">
            Coming soon! We're still determining our wrap packages.
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{service.name}</h3>
        
        {renderServiceSpecificFields()}

        <FormField
          control={form.control}
          name={`service_details.${serviceId}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please describe what you need..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Upload Images</FormLabel>
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-video">
                  <img
                    src={url}
                    alt={`Service image ${index + 1}`}
                    className={cn(
                      "rounded-lg object-cover w-full h-full",
                      "border border-border"
                    )}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => onImageRemove(url, serviceId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button 
            variant="outline" 
            className="w-full gap-2"
            asChild
          >
            <label>
              <Upload className="h-4 w-4" />
              Upload Images
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </label>
          </Button>
          <p className="text-sm text-muted-foreground">
            Upload images to help us better understand your service needs.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
