import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
  contact_preference: z.enum(["phone", "email"]),
  service_id: z.string().uuid("Please select a service"),
  vehicle_make: z.string().min(2, "Vehicle make must be at least 2 characters"),
  vehicle_model: z.string().min(2, "Vehicle model must be at least 2 characters"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_serial: z.string().optional(),
  additional_notes: z.string().optional(),
  timeframe: z.enum(["flexible", "asap", "within_week", "within_month"]),
})

type QuoteRequestFormFieldsProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
  onFileUpload: (file: File) => Promise<void>
  mediaUrl: string | null
  uploading: boolean
  onMediaRemove: () => void
}

export function QuoteRequestFormFields({ form, onFileUpload, mediaUrl, uploading, onMediaRemove }: QuoteRequestFormFieldsProps) {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
      
      if (error) throw error
      return data
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(555) 555-5555" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="service_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service</FormLabel>
            <FormControl>
              <ToggleGroup 
                type="single" 
                value={field.value} 
                onValueChange={field.onChange}
                className="flex flex-wrap gap-2"
              >
                {services?.map((service) => (
                  <ToggleGroupItem 
                    key={service.id} 
                    value={service.id}
                    className="px-4 py-2 rounded-md data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white"
                  >
                    {service.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Make</FormLabel>
              <FormControl>
                <Input placeholder="Toyota" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vehicle_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Model</FormLabel>
              <FormControl>
                <Input placeholder="Camry" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="vehicle_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2024"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vehicle_serial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Serial Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="VIN or Serial Number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="additional_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information about your request..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <FormLabel>Media Upload</FormLabel>
        <div 
          onClick={() => document.getElementById('file-upload')?.click()}
          className={`
            relative cursor-pointer
            border-2 border-dashed border-border
            rounded-lg p-8
            flex flex-col items-center justify-center
            transition-colors
            hover:border-[#9b87f5]
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <ImageIcon className="h-10 w-10 mb-4 text-[#9b87f5]" />
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Click or drag files to upload</h3>
            <p className="text-sm text-muted-foreground">
              Supported formats: JPG, PNG, MP4, MOV
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*,video/mp4,video/quicktime"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Upload images or videos of the damage (max 10MB per file)
        </p>
        {mediaUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-background">
            <img
              src={mediaUrl}
              alt="Uploaded preview"
              className="w-full h-full object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onMediaRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <FormField
          control={form.control}
          name="contact_preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Contact Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred contact method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeframe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timeframe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred timeframe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  <SelectItem value="asap">As Soon As Possible</SelectItem>
                  <SelectItem value="within_week">Within a Week</SelectItem>
                  <SelectItem value="within_month">Within a Month</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}

export { formSchema }