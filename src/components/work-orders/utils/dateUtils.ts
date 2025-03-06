
import { format } from "date-fns";

/**
 * Format a date object or ISO string to a time string (e.g. "9:30 AM")
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "h:mm a");
}
