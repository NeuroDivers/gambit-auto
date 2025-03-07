
export interface CustomerInfoFieldsProps {
  customerFirstName: string;
  setCustomerFirstName: (value: string) => void;
  customerLastName: string;
  setCustomerLastName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone?: string;
  setCustomerPhone: (value: string) => void;
  customerAddress?: string;
  setCustomerAddress?: (value: string) => void;
  customers?: any[];
  isLoadingCustomers?: boolean;
  onCustomerSelect?: (customerId: string) => void;
  customerStreetAddress?: string;
  setCustomerStreetAddress?: (value: string) => void;
  customerUnitNumber?: string;
  setCustomerUnitNumber?: (value: string) => void;
  customerCity?: string;
  setCustomerCity?: (value: string) => void;
  customerStateProvince?: string;
  setCustomerStateProvince?: (value: string) => void;
  customerPostalCode?: string;
  setCustomerPostalCode?: (value: string) => void;
  customerCountry?: string;
  setCustomerCountry?: (value: string) => void;
  clientIdField?: string;
  setClientId?: (value: string) => void;
}

// Add a default export that points to the type
export default CustomerInfoFieldsProps;
