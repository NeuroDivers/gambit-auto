import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerInfoFields } from "./CustomerInfoFields";
import { VehicleInfoFields } from "./VehicleInfoFields";
import { SchedulingFields } from "./SchedulingFields";
import { BayAssignmentField } from "./BayAssignmentField";
import { AdditionalNotesField } from "./AdditionalNotesField";
import { WorkOrderFormHeader } from "./WorkOrderFormHeader";
import { ServiceItemType } from "@/types/service-item";
import ServiceSelectionField from "@/components/shared/form-fields/ServiceSelectionField";
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";
import { CustomerType } from "../types";
import { Separator } from "@/components/ui/separator";

interface FormSectionsProps {
  onSubmit: () => void;
  customer: CustomerType | null;
  onCustomerChange: (customer: CustomerType | null) => void;
  vehicleInfo: any;
  onVehicleInfoChange: (vehicleInfo: any) => void;
  scheduleInfo: any;
  onScheduleInfoChange: (scheduleInfo: any) => void;
  bayId: string | null;
  onBayIdChange: (bayId: string | null) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  services: ServiceItemType[];
  onServicesChange: (services: ServiceItemType[]) => void;
  isCreating: boolean;
  isSubmitting: boolean;
}

export function FormSections({
  onSubmit,
  customer,
  onCustomerChange,
  vehicleInfo,
  onVehicleInfoChange,
  scheduleInfo,
  onScheduleInfoChange,
  bayId,
  onBayIdChange,
  notes,
  onNotesChange,
  services,
  onServicesChange,
  isCreating,
  isSubmitting,
}: FormSectionsProps) {
  const [activeTab, setActiveTab] = useState("customer");

  const tabs = ["customer", "vehicle", "services", "scheduling", "notes"];
  
  const getNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      return tabs[currentIndex + 1];
    }
    return activeTab;
  };
  
  const getPreviousTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      return tabs[currentIndex - 1];
    }
    return activeTab;
  };

  return (
    <div className="space-y-6">
      <WorkOrderFormHeader
        isCreating={isCreating}
        customerName={customer ? `${customer.first_name} ${customer.last_name}` : ""}
        date={scheduleInfo?.date}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customer" className="pt-4">
          <CustomerInfoFields
            customer={customer}
            onCustomerChange={onCustomerChange}
          />
          <div className="flex justify-end mt-6">
            <Button onClick={() => setActiveTab(getNextTab())}>
              Next <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="vehicle" className="pt-4">
          <VehicleInfoFields
            customer={customer}
            vehicleInfo={vehicleInfo}
            onVehicleInfoChange={onVehicleInfoChange}
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setActiveTab(getPreviousTab())}>
              <MoveLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button onClick={() => setActiveTab(getNextTab())}>
              Next <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="pt-4">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Service Selection</h3>
              <ServiceSelectionField
                services={services}
                onChange={onServicesChange}
                disabled={false}
                showAssignedStaff={true}
              />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setActiveTab(getPreviousTab())}>
              <MoveLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button onClick={() => setActiveTab(getNextTab())}>
              Next <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="scheduling" className="pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <SchedulingFields
              scheduleInfo={scheduleInfo}
              onScheduleInfoChange={onScheduleInfoChange}
            />
            <BayAssignmentField
              bayId={bayId}
              onBayIdChange={onBayIdChange}
            />
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setActiveTab(getPreviousTab())}>
              <MoveLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button onClick={() => setActiveTab(getNextTab())}>
              Next <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="notes" className="pt-4">
          <AdditionalNotesField
            notes={notes}
            onNotesChange={onNotesChange}
          />
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setActiveTab(getPreviousTab())}>
              <MoveLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button 
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Saving..." : (isCreating ? "Create Work Order" : "Update Work Order")}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <div className="flex justify-end">
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? "Saving..." : (isCreating ? "Create Work Order" : "Update Work Order")}
        </Button>
      </div>
    </div>
  );
}
