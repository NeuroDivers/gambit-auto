
import { CustomerInfoFieldsProps } from "@/components/invoices/form-sections/CustomerInfoFieldsProps";
import CustomerInfoFields from "@/components/invoices/form-sections/CustomerInfoFields";

export { CustomerInfoFields };

export default function CustomerInfoFieldsWrapper(props: CustomerInfoFieldsProps) {
  return <CustomerInfoFields {...props} />;
}
