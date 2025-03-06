
export function formatTime(date: string | Date | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
