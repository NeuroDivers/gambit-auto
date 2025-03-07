
import { UseFormReturn } from "react-hook-form";

export interface ServiceDetailFieldProps {
  value: any;
  onChange: (details: Record<string, any>) => void;
  form?: UseFormReturn<any>;
  serviceId?: string;
}

export interface ServiceImageUploadProps {
  images: string[];
  onUpload: (file: File) => Promise<string>;
  onRemove: (imageUrl: string) => void;
}
