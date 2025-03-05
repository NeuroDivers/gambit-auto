
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { WorkOrderFormValues } from "@/types/work-order";

// Mock components for the form sections
const SchedulingFields = () => (
  <div>Scheduling Fields (Mock Component)</div>
);

const BayAssignmentField = () => (
  <div>Bay Assignment Field (Mock Component)</div>
);

const TimeSelectionFields = () => (
  <div>Time Selection Fields (Mock Component)</div>
);

const ServiceSelectionFields = () => (
  <div>Service Selection Fields (Mock Component)</div>
);

const VehicleInfoFields = () => (
  <div>Vehicle Info Fields (Mock Component)</div>
);

const NotesFields = () => (
  <div>Notes Fields (Mock Component)</div>
);

export function FormSections() {
  const { setValue } = useFormContext<WorkOrderFormValues>();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Customer details</CardDescription>
        </CardHeader>
        <CardContent>
          <div>Customer information will be displayed here</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling</CardTitle>
          <CardDescription>Set date and time for the service</CardDescription>
        </CardHeader>
        <CardContent>
          <SchedulingFields />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bay Assignment</CardTitle>
          <CardDescription>Assign a service bay</CardDescription>
        </CardHeader>
        <CardContent>
          <BayAssignmentField />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Selection</CardTitle>
          <CardDescription>Select time slots for the service</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeSelectionFields />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Selection</CardTitle>
          <CardDescription>Select services to be performed</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceSelectionFields />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
          <CardDescription>Enter or edit vehicle details</CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleInfoFields />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Add any additional information</CardDescription>
        </CardHeader>
        <CardContent>
          <NotesFields />
        </CardContent>
      </Card>
    </div>
  );
}
