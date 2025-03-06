
import { ReactNode, createContext, useContext, useState } from "react";
import { ServiceFormData } from "@/types/service-item";

type QuoteFormContextType = {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
};

const defaultFormData: ServiceFormData = {
  service_type: "",
  service_items: [],
  description: "",
  service_details: {},
  vehicleInfo: {
    make: "",
    model: "",
    year: 0,
    vin: "",
    color: "",
    saveToAccount: false,
  },
};

const QuoteFormContext = createContext<QuoteFormContextType | undefined>(undefined);

export function QuoteFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(0);

  const updateFormData = (data: Partial<ServiceFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setCurrentStep(0);
  };

  return (
    <QuoteFormContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
        resetForm,
      }}
    >
      {children}
    </QuoteFormContext.Provider>
  );
}

export function useQuoteFormContext() {
  const context = useContext(QuoteFormContext);
  if (context === undefined) {
    throw new Error("useQuoteFormContext must be used within a QuoteFormProvider");
  }
  return context;
}
