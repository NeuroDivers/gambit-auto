
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove?: (url: string) => void;
  value?: string | string[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // In MB
  label?: string;
  className?: string;
}

export function ImageUpload({
  onUpload,
  onRemove,
  value = [],
  multiple = false,
  maxFiles = 5,
  maxSize = 5,
  label = 'Upload Images',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  
  // Convert value to array for consistent handling
  const images = Array.isArray(value) ? value : value ? [value] : [];
  
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed the maximum
    if (multiple && maxFiles && images.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }
    
    setUploading(true);
    
    try {
      // This is a placeholder - in a real implementation, this would upload to storage
      // For now, we'll just simulate uploading by creating object URLs
      Array.from(files).forEach(file => {
        if (file.size > maxSize * 1024 * 1024) {
          toast.error(`File ${file.name} exceeds the ${maxSize}MB size limit`);
          return;
        }
        
        // Create object URL for demo purposes
        const url = URL.createObjectURL(file);
        onUpload(url);
      });
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };
  
  const handleRemove = (url: string) => {
    if (onRemove) {
      onRemove(url);
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">
              {multiple ? `Up to ${maxFiles} images, max ${maxSize}MB each` : `Maximum ${maxSize}MB`}
            </span>
            <Button variant="outline" type="button" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Browse Files'}
            </Button>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Uploaded image ${index + 1}`}
                className="object-cover w-full h-32 rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XCircle size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
