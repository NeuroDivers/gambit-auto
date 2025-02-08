
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { CalendarX } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const blockedDateSchema = z.object({
  start_date: z.date({
    required_error: "A start date is required",
  }),
  end_date: z.date({
    required_error: "An end date is required",
  }).refine((date) => date instanceof Date, {
    message: "Invalid end date",
  }),
  reason: z.string().optional(),
})

type BlockedDateFormValues = z.infer<typeof blockedDateSchema>

export function BlockedDatesDialog() {
  const [open, setOpen] = useState(false)
  const [dateDialogOpen, setDateDialogOpen] = useState<'start' | 'end' | null>(null)
  
  const form = useForm<BlockedDateFormValues>({
    resolver: zodResolver(blockedDateSchema),
  })

  const onSubmit = async (data: BlockedDateFormValues) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .insert([{
          start_date: data.start_date.toISOString(),
          end_date: data.end_date.toISOString(),
          reason: data.reason,
        }])

      if (error) throw error

      toast.success("Date range blocked successfully")
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error blocking dates:', error)
      toast.error("Failed to block dates")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarX className="h-4 w-4" />
          Block Dates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Block Calendar Dates</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Dialog open={dateDialogOpen === 'start'} onOpenChange={(open) => setDateDialogOpen(open ? 'start' : null)}>
                    <DialogTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          type="button"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarX className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select Start Date</DialogTitle>
                      </DialogHeader>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setDateDialogOpen(null)
                        }}
                        initialFocus
                      />
                    </DialogContent>
                  </Dialog>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Dialog open={dateDialogOpen === 'end'} onOpenChange={(open) => setDateDialogOpen(open ? 'end' : null)}>
                    <DialogTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          type="button"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarX className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select End Date</DialogTitle>
                      </DialogHeader>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setDateDialogOpen(null)
                        }}
                        initialFocus
                        fromDate={form.getValues("start_date")}
                      />
                    </DialogContent>
                  </Dialog>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Holiday closure, Staff training..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Block Dates
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
