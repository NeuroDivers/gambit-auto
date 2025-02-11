
import { startOfDay, isSameDay, parseISO, format, addDays } from "date-fns"
import { WorkOrder } from "../../work-orders/types"

export const getWorkOrderSpan = (workOrder: WorkOrder, startIndex: number, totalDays: number) => {
  if (!workOrder.estimated_duration) {
    console.log('No duration specified for work order:', workOrder.id);
    return 1;
  }
  
  const duration = parseInt(workOrder.estimated_duration);
  if (isNaN(duration)) {
    console.log('Invalid duration for work order:', workOrder.id);
    return 1;
  }
  
  const remainingDays = totalDays - startIndex;
  const span = Math.min(duration, remainingDays);
  console.log('Work order span calculation:', {
    workOrderId: workOrder.id,
    duration,
    remainingDays,
    finalSpan: span,
    startIndex,
    totalDays
  });
  return span;
}

export const findWorkOrderForDate = (date: Date, bayId: string, workOrders: WorkOrder[]) => {
  const workOrder = workOrders.find(order => {
    if (!order.start_time || order.assigned_bay_id !== bayId) return false;
    
    const orderStartDate = startOfDay(new Date(order.start_time));
    const duration = order.estimated_duration ? parseInt(order.estimated_duration) : 1;
    const orderEndDate = addDays(orderStartDate, duration - 1);
    
    const isWithinRange = date >= orderStartDate && date <= orderEndDate;
    
    if (isWithinRange) {
      console.log('Found work order for date:', {
        date: date.toISOString(),
        workOrderId: order.id,
        startDate: orderStartDate.toISOString(),
        endDate: orderEndDate.toISOString(),
        duration
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
  return format(parseISO(timeString), 'h:mm a');
}
