
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { useState } from "react";

export interface ServiceImageUploadProps {
  images: string[];
  onImageUpload: (url: string) => void;
  onRemove: (imageUrl: string) => void;
}

export function ServiceImageUpload({ images, onImageUpload, onRemove }: ServiceImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      // Mock upload or use actual upload functionality
      // This is a placeholder - replace with actual image upload logic
      const mockImageUrl = URL.createObjectURL(files[0]);
      onImageUpload(mockImageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
    
    // Reset the input
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Service Images</h4>
        <div>
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={isUploading}
              asChild
            >
              <span>
                <ImagePlus className="mr-2 h-4 w-4" />
                Add Image
              </span>
            </Button>
          </label>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Service image ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(image)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No images added yet</p>
        </div>
      )}
    </div>
  );
}
