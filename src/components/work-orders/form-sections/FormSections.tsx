
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { ServiceSelectionFields } from "./ServiceSelectionFields"
import { NotesFields } from "./NotesFields"
import { SchedulingFields } from "./SchedulingFields"
import { BayAssignmentField } from "./BayAssignmentField"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Car, Wrench, Calendar, Warehouse, FileText } from "lucide-react"

interface FormSectionsProps {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ form, isSubmitting, isEditing }: FormSectionsProps) {
  const { control, watch, setValue } = form;
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerInfoFields control={control} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-muted-foreground" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleInfoFields control={control} watch={watch} setValue={setValue} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceSelectionFields form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SchedulingFields form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-muted-foreground" />
            Service Bay Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BayAssignmentField form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotesFields form={form} />
        </CardContent>
      </Card>
    </div>
  )
}
