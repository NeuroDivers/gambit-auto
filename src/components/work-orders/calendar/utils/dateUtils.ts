
import { format, parse } from "date-fns";

export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return "";
  
  try {
    // If the timeString is a full ISO date
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      return format(date, "h:mm a");
    }
    
    // If it's just a time string like "14:30:00"
    return format(parse(timeString, "HH:mm:ss", new Date()), "h:mm a");
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
}
