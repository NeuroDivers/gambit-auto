
import { toast } from "sonner";

export const showToast = {
  success: (title: string, message?: string) => {
    toast(title, { description: message });
  },
  error: (title: string, message?: string) => {
    toast(title, { 
      description: message,
      style: { backgroundColor: 'red', color: 'white' }
    });
  },
  info: (title: string, message?: string) => {
    toast(title, { description: message });
  },
  warning: (title: string, message?: string) => {
    toast(title, { description: message });
  }
};
