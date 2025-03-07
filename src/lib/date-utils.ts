
import { format, isToday, formatDistanceToNow } from "date-fns";

// Format a date for display
export const formatDate = (date: Date | string | null | undefined, formatString = 'PPP'): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Format a time for display (HH:MM AM/PM)
export const formatTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

// Format a date and time for display
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'PPP p');
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return 'Invalid date/time';
  }
};

// Format a date for relative display (e.g., "today", "2 days ago", etc.)
export const formatRelativeDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'h:mm a')}`;
    }
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid date';
  }
};

// Format time for display in calendar
export const formatTimeDisplay = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  try {
    return format(new Date(date), 'h:mm a');
  } catch (error) {
    console.error('Error formatting time display:', error);
    return '';
  }
};

// Get date in ISO format (YYYY-MM-DD)
export const getISODate = (date: Date | string): string => {
  try {
    return format(new Date(date), 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error getting ISO date:', error);
    return '';
  }
};
