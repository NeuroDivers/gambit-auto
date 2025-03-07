
// Basic date utility functions needed by components
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  return format(new Date(date), formatStr);
}

export function getDaysOfWeek(date: Date): Date[] {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return eachDayOfInterval({ start, end });
}

export function getTimeDisplay(date: Date | string | null): string {
  if (!date) return '';
  return format(new Date(date), 'h:mm a');
}

export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return '';
  const startTime = format(new Date(start), 'h:mm a');
  if (!end) return startTime;
  const endTime = format(new Date(end), 'h:mm a');
  return `${startTime} - ${endTime}`;
}
