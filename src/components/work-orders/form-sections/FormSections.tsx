
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

export interface FormSectionsProps {
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
          {/* Pass customerId instead of customer object */}
          <CustomerInfoFields
            customerId={customer?.id}
            onSelectCustomer={onCustomerChange}
          />
          <div className="flex justify-end mt-6">
            <Button onClick={() => setActiveTab(getNextTab())}>
              Next <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="vehicle" className="pt-4">
          <VehicleInfoFields
            customerId={customer?.id}
            data={vehicleInfo}
            onChange={onVehicleInfoChange}
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
              {/* Use the converter to fix type mismatch */}
              <ServiceSelectionField
                services={services.map(svc => ({
                  ...svc,
                  commission_type: svc.commission_type === 'fixed' ? 'percentage' : svc.commission_type
                }))}
                onChange={(updatedServices) => {
                  // Convert back to the right format
                  const convertedServices = updatedServices.map(svc => ({
                    ...svc,
                    commission_type: svc.commission_type === 'flat' ? 'fixed' : svc.commission_type,
                    description: svc.description || ""
                  }));
                  onServicesChange(convertedServices as ServiceItemType[]);
                }}
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
              value={scheduleInfo}
              onChange={onScheduleInfoChange}
            />
            <BayAssignmentField
              value={bayId}
              onChange={onBayIdChange}
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
            value={notes}
            onChange={onNotesChange}
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
