import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { businessFormSchema, BusinessFormValues } from "../schemas/businessFormSchema"
import { Building, Mail, Phone, MapPin, Image, Loader2, Sun, Moon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface BusinessFormProps {
  businessProfile: any
}

export function BusinessForm({ businessProfile }: BusinessFormProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = React.useState(false)
  const [lightLogoPreview, setLightLogoPreview] = React.useState<string | null>(null)
  const [darkLogoPreview, setDarkLogoPreview] = React.useState<string | null>(null)
  
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      company_name: "",
      email: "",
      phone_number: "",
      address: "",
      light_logo_url: "",
      dark_logo_url: "",
    }
  })

  React.useEffect(() => {
    if (businessProfile) {
      form.reset({
        company_name: businessProfile.company_name || "",
        email: businessProfile.email || "",
        phone_number: businessProfile.phone_number || "",
        address: businessProfile.address || "",
        light_logo_url: businessProfile.light_logo_url || "",
        dark_logo_url: businessProfile.dark_logo_url || "",
      })
      setLightLogoPreview(businessProfile.light_logo_url || null)
      setDarkLogoPreview(businessProfile.dark_logo_url || null)
    }
  }, [businessProfile, form])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, logoType: 'light' | 'dark') => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-logos')
        .getPublicUrl(fileName)

      // Update the form
      if (logoType === 'light') {
        form.setValue('light_logo_url', publicUrl)
        setLightLogoPreview(publicUrl)
      } else {
        form.setValue('dark_logo_url', publicUrl)
        setDarkLogoPreview(publicUrl)
      }

      toast({
        title: "Success",
        description: `${logoType === 'light' ? 'Light' : 'Dark'} logo uploaded successfully.`,
      })
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload logo. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(values: BusinessFormValues) {
    try {
      const { error } = businessProfile 
        ? await supabase
            .from("business_profile")
            .update(values)
            .eq("id", businessProfile.id)
        : await supabase
            .from("business_profile")
            .insert([values])

      if (error) throw error

      toast({
        title: "Success",
        description: "Business profile updated successfully.",
      })
    } catch (error) {
      console.error("Error updating business profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error updating the business profile.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building className="h-4 w-4 text-[#9b87f5]" />
                Company Name
              </FormLabel>
              <FormDescription>
                The official name of your business
              </FormDescription>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    onChange={(e) => handleFileUpload(e, 'light')}
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
                    onChange={(e) => handleFileUpload(e, 'dark')}
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#9b87f5]" />
                Business Email
              </FormLabel>
              <FormDescription>
                Your primary business contact email
              </FormDescription>
              <FormControl>
                <Input {...field} type="email" />
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
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#9b87f5]" />
                Business Phone
              </FormLabel>
              <FormDescription>
                Your primary business contact number
              </FormDescription>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#9b87f5]" />
                Business Address
              </FormLabel>
              <FormDescription>
                Your business's physical location
              </FormDescription>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
          disabled={isUploading}
        >
          Save Changes
        </Button>
      </form>
    </Form>
  )
}
