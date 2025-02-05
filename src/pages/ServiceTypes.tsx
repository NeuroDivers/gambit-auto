import { ServiceTypesList } from "@/components/services/ServiceTypesList";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";

export default function ServiceTypes() {
  return (
    <>
      <PageBreadcrumbs />
      <ServiceTypesList />
    </>
  );
}