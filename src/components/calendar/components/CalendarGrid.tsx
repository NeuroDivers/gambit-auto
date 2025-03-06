import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { add, endOfMonth, startOfMonth, sub } from "date-fns"
import { useState } from "react"
import { useWorkOrderData } from "../useWorkOrderData"

interface CalendarGridProps {
  date: Date
  setDate: (date: Date) => void
}

export function CalendarGrid({ date, setDate }: CalendarGridProps) {
  const [month, setMonth] = useState(date)
  const { data: workOrders = [], isLoading } = useWorkOrderData()

  const workOrdersByDate = workOrders.reduce((acc: { [key: string]: any[] }, workOrder) => {
    if (!workOrder.start_time) return acc

    const startTime = new Date(workOrder.start_time).toLocaleDateString()
    if (!acc[startTime]) {
      acc[startTime] = []
    }
    acc[startTime].push(workOrder)
    return acc
  }, {})

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between p-4 mb-2">
        <CardTitle className="text-base font-semibold">
          {date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(sub(month, { months: 1 }))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(add(month, { months: 1 }))}
          >
            Next
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <Calendar
          mode="single"
          month={month}
          selected={date}
          onSelect={setDate}
          initialFocus
          className="border rounded-md"
        />
      </CardContent>
      <CardFooter className="p-4">
        <h4 className="mb-2 font-medium">Work Orders for {date.toLocaleDateString()}</h4>
        {isLoading ? (
          <div>Loading work orders...</div>
        ) : !workOrdersByDate[date.toLocaleDateString()] ? (
          <div>No work orders scheduled for this day.</div>
        ) : (
          <div className="grid gap-2">
            {workOrdersByDate[date.toLocaleDateString()].map((workOrder) => (
              <div key={workOrder.id} className="p-2 border-b border-gray-200">
                {workOrder.customer_first_name} {workOrder.customer_last_name}
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
