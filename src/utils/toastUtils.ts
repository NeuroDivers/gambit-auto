
import { sonnerToast } from '@/hooks/use-toast';

/**
 * Show a success toast notification
 */
export function showSuccessToast(title: string, description?: string) {
  sonnerToast.success(title, {
    description,
    duration: 3000,
  });
}

/**
 * Show an error toast notification
 */
export function showErrorToast(title: string, description?: string) {
  sonnerToast.error(title, {
    description,
    duration: 4000,
  });
}

/**
 * Show an info toast notification
 */
export function showInfoToast(title: string, description?: string) {
  sonnerToast.info(title, {
    description,
    duration: 3000,
  });
}

/**
 * Show a warning toast notification
 */
export function showWarningToast(title: string, description?: string) {
  sonnerToast.warning(title, {
    description,
    duration: 3500,
  });
}
