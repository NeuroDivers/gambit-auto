import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PersonalInfoFields } from "@/components/shared/form-fields/PersonalInfoFields"
import { VehicleInfoFields } from "@/components/shared/form-fields/VehicleInfoFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button as ShadcnButton } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type FormSectionsProps = {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ form, isSubmitting, isEditing }: FormSectionsProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonalInfoFields form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleInfoFields form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <ShadcnButton
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </ShadcnButton>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <ServiceSelectionField form={form} />

      <CardFooter className="flex justify-end space-x-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 
            (isEditing ? "Updating..." : "Creating...") : 
            (isEditing ? "Update Work Order" : "Create Work Order")
          }
        </Button>
      </CardFooter>
    </>
  )
}