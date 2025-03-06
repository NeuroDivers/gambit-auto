
import { useFormStorage } from "./quote-request/useFormStorage";
import { ServiceFormData } from "@/types/service-item";
import { useCallback } from "react";

export function useQuoteRequestForm() {
  const { formData, updateFormData, resetFormData } = useFormStorage();
  
  const clearFormData = useCallback(() => {
    resetFormData();
  }, [resetFormData]);

  return {
    formData,
    updateFormData,
    resetFormData: clearFormData
  };
}
