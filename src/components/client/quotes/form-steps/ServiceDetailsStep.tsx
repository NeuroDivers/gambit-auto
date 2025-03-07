import { UseFormReturn } from 'react-hook-form';
import { ServiceFormData, ServiceItemType } from '@/types/service-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

interface ServiceDetailsStepProps {
  form: UseFormReturn<ServiceFormData>;
  services: ServiceItemType[];
  serviceId: string | null;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove: (url: string) => void;
}

export function ServiceDetailsStep({ 
  form, 
  services, 
  serviceId, 
  onImageUpload, 
  onImageRemove 
}: ServiceDetailsStepProps) {
  const [images, setImages] = useState<string[]>([]);
  const { control, watch, setValue } = form;
  const description = watch('description') || '';
  
  const handleImageUpload = async (file: File) => {
    try {
      const url = await onImageUpload(file);
      const newImages = [...images, url];
      setImages(newImages);
      setValue('images', newImages);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  const handleImageRemove = (url: string) => {
    const newImages = images.filter(image => image !== url);
    setImages(newImages);
    setValue('images', newImages);
    onImageRemove(url);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you need in more detail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>
          
          <div className="space-y-3">
            <FormLabel>Upload Images (Optional)</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                  <img 
                    src={image} 
                    alt={`Uploaded image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleImageRemove(image)}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <ImageUpload
                onUpload={handleImageUpload}
                className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <PlusIcon className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">Add Image</span>
              </ImageUpload>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
