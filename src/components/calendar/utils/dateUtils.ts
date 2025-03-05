
import { startOfDay, isSameDay, parseISO, format, addDays, isWithinInterval } from "date-fns"
import { WorkOrder } from "@/types/work-order"

export const getWorkOrderSpan = (workOrder: WorkOrder, startIndex: number, totalDays: number) => {
  if (!workOrder.start_time || !workOrder.end_time) {
    console.log('Missing start or end time for work order:', workOrder.id);
    return 1;
  }
  
  const startDate = startOfDay(new Date(workOrder.start_time));
  const endDate = startOfDay(new Date(workOrder.end_time));
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const remainingDays = totalDays - startIndex;
  const span = Math.min(daysDiff, remainingDays);
  
  console.log('Work order span calculation:', {
    workOrderId: workOrder.id,
    startDate,
    endDate,
    daysDiff,
    remainingDays,
    finalSpan: span,
    startIndex,
    totalDays
  });
  
  return Math.max(1, span);
}

export const findWorkOrderForDate = (date: Date, bayId: string, workOrders: WorkOrder[]) => {
  const targetDate = startOfDay(date);
  
  const workOrder = workOrders.find(order => {
    if (!order.start_time || !order.end_time || order.assigned_bay_id !== bayId) return false;
    
    const orderStartDate = startOfDay(new Date(order.start_time));
    const orderEndDate = startOfDay(new Date(order.end_time));
    
    const isWithinRange = isWithinInterval(targetDate, { start: orderStartDate, end: orderEndDate });
    
    if (isWithinRange) {
      console.log('Found work order for date:', {
        date: targetDate.toISOString(),
        workOrderId: order.id,
        startDate: orderStartDate.toISOString(),
        endDate: orderEndDate.toISOString()
      });
    }
    
    return isWithinRange;
  });

  return workOrder;
}

export const isWorkOrderStart = (date: Date, workOrder: WorkOrder) => {
  if (!workOrder.start_time) return false;
  const isStart = isSameDay(startOfDay(new Date(workOrder.start_time)), startOfDay(date));
  if (isStart) {
    console.log('Work order starts on:', {
      date: date.toISOString(),
      workOrderId: workOrder.id,
      startTime: workOrder.start_time
    });
  }
  return isStart;
}

export const formatTime = (timeString: string | null | undefined) => {
  if (!timeString) return '';
  try {
    return format(parseISO(timeString), 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}
