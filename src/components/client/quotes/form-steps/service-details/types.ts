
import { UseFormReturn } from "react-hook-form";

export interface ServiceDetailFieldProps {
  value: Record<string, any>;
  onChange: (details: Record<string, any>) => void;
  form?: UseFormReturn<any>;
  serviceId?: string;
}

export interface ServiceImageUploadProps {
  images: string[];
  onImageUpload: (url: string) => void;
  onRemove: (imageUrl: string) => void;
}
