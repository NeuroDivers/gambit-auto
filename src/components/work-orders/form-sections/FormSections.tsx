
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSearch } from "./CustomerSearch";
import { WorkOrderFormValues } from "../types";
import { useFormContext } from "react-hook-form";

interface SchedulingFieldsProps {
  onChange: (scheduleInfo: any) => void;
}

interface BayAssignmentFieldProps {
  onChange: (bayId: string) => void;
}

// Mock components for the missing imports
const SchedulingFields = ({ onChange }: SchedulingFieldsProps) => (
  <div>Scheduling Fields (Mock Component)</div>
);

const BayAssignmentField = ({ onChange }: BayAssignmentFieldProps) => (
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
  const { watch, setValue } = useFormContext<WorkOrderFormValues>();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [scheduleInfo, setScheduleInfo] = useState<any>({
    date: "",
    time: "",
  });
  const [bayId, setBayId] = useState("");

  // Watch for changes in form values
  const formValues = watch();

  // Handle customer selection
  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setValue("customer_id", customer.id);
    setValue("customer_first_name", customer.first_name);
    setValue("customer_last_name", customer.last_name);
    setValue("customer_email", customer.email);
    setValue("customer_phone", customer.phone);
    setValue("customer_address", customer.address || "");
    setValue("customer_city", customer.city || "");
    setValue("customer_state", customer.state || "");
    setValue("customer_zip", customer.zip_code || "");
  };

  // Handle vehicle selection
  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setValue("vehicle_id", vehicle.id);
    setValue("vehicle_make", vehicle.make);
    setValue("vehicle_model", vehicle.model);
    setValue("vehicle_year", vehicle.year);
    setValue("vehicle_color", vehicle.color);
    setValue("vehicle_vin", vehicle.vin);
    setValue("vehicle_license_plate", vehicle.license_plate);
  };

  // Handle scheduling change
  const handleScheduleChange = (info: any) => {
    setScheduleInfo(info);
    setValue("service_date", info.date);
    setValue("service_time", info.time);
  };

  // Handle bay assignment change
  const handleBayChange = (id: string) => {
    setBayId(id);
    setValue("bay_id", id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Search for existing customer or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerSearch
            onSelectCustomer={handleSelectCustomer}
            onSelectVehicle={handleSelectVehicle}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling</CardTitle>
          <CardDescription>Set date and time for the service</CardDescription>
        </CardHeader>
        <CardContent>
          <SchedulingFields onChange={handleScheduleChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bay Assignment</CardTitle>
          <CardDescription>Assign a service bay</CardDescription>
        </CardHeader>
        <CardContent>
          <BayAssignmentField onChange={handleBayChange} />
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
