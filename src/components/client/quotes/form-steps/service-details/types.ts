
import { UseFormReturn } from "react-hook-form";

export interface ServiceDetailFieldProps {
  form: UseFormReturn<any>;
  serviceId: string;
  value: any;
  onChange: (value: any) => void;
}

export interface ServiceImageUploadProps {
  images: string[];
  onImageUpload: (url: string) => void;
  onRemove: (url: string) => void;
}
