
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface ServiceImageUploadProps {
  images: string[];
  onUpload: (file: File) => Promise<string>;
  onRemove: (imageUrl: string) => void;
}

export function ServiceImageUpload({ images, onUpload, onRemove }: ServiceImageUploadProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await onUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <img 
              src={url} 
              alt={`Uploaded ${index + 1}`} 
              className="h-24 w-24 object-cover rounded-md border border-border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(url)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <label className="h-24 w-24 border-2 border-dashed border-muted-foreground/50 rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
          <span className="text-muted-foreground text-sm">Add Image</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
}
