
import { toast } from 'sonner';

/**
 * Show a success toast notification
 */
export function showSuccessToast(title: string, description?: string) {
  toast.success(title, {
    description,
    duration: 3000,
  });
}

/**
 * Show an error toast notification
 */
export function showErrorToast(title: string, description?: string) {
  toast.error(title, {
    description,
    duration: 4000,
  });
}

/**
 * Show an info toast notification
 */
export function showInfoToast(title: string, description?: string) {
  toast.info(title, {
    description,
    duration: 3000,
  });
}

/**
 * Show a warning toast notification
 */
export function showWarningToast(title: string, description?: string) {
  toast.warning(title, {
    description,
    duration: 3500,
  });
}
