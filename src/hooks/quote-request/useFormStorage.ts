
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { ServiceFormData } from "@/types/service-item";

export function useFormStorage(formKey: string) {
  const [storedFormData, setStoredFormData] = useLocalStorage<ServiceFormData | null>(formKey, null);
  const [formData, setFormData] = useState<ServiceFormData | null>(null);

  // Initialize with default values to match the ServiceFormData type
  const getInitialFormData = (): ServiceFormData => ({
    vehicleInfo: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      saveToAccount: false // Add the missing required property
    },
    service_items: [],
    description: "",
    service_details: {}
  });

  useEffect(() => {
    if (storedFormData) {
      // Ensure all required fields exist when loading from storage
      const completeData = {
        ...getInitialFormData(),
        ...storedFormData,
        vehicleInfo: {
          ...getInitialFormData().vehicleInfo,
          ...storedFormData.vehicleInfo
        }
      };
      setFormData(completeData);
    } else {
      setFormData(getInitialFormData());
    }
  }, [storedFormData]);

  const updateFormData = (newData: Partial<ServiceFormData>) => {
    const updated = { ...formData, ...newData } as ServiceFormData;
    setFormData(updated);
    setStoredFormData(updated);
  };

  const clearStoredFormData = () => {
    setStoredFormData(null);
    setFormData(getInitialFormData());
  };

  return {
    formData,
    updateFormData,
    clearStoredFormData
  };
}
