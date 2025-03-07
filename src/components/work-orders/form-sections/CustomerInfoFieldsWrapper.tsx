
import CustomerInfoFields from "@/components/invoices/form-sections/CustomerInfoFields";
import { CustomerInfoFieldsProps } from "@/components/invoices/form-sections/CustomerInfoFieldsProps";

export { CustomerInfoFields };

export default function CustomerInfoFieldsWrapper(props: CustomerInfoFieldsProps) {
  return <CustomerInfoFields {...props} />;
}
