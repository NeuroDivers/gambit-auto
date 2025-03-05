
import { ServiceItemType, ServiceFormData } from "@/types/service-item";

export interface QuoteRequestFormState {
  step: number;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: string;
    vin?: string;
    id?: string;
  };
  service: ServiceFormData;
  summary: {
    notes: string;
  };
}

export interface QuoteRequestFormAction {
  type: 'SET_STEP' | 'UPDATE_CUSTOMER' | 'UPDATE_VEHICLE' | 'UPDATE_SERVICE' | 'UPDATE_SUMMARY' | 'RESET';
  payload?: any;
}
