
import { format, formatDistanceToNow, differenceInDays, isToday, isYesterday } from "date-fns";

export function formatMessageTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const daysDifference = differenceInDays(now, date);

  if (daysDifference > 3) {
    return format(date, 'MMM d, yyyy');
  }

  if (daysDifference >= 1) {
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return `${daysDifference} days ago`;
  }

  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return format(date, 'MMM d, yyyy');
}

export function getRecipientDisplayName(recipient: any) {
  if (recipient?.first_name && recipient?.last_name) {
    return `${recipient.first_name} ${recipient.last_name}`;
  }
  return recipient?.email || "Unknown User";
}
