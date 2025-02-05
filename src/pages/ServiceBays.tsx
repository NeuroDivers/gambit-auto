import { ServiceBaysList } from "@/components/service-bays/ServiceBaysList";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";

export default function ServiceBays() {
  return (
    <>
      <PageBreadcrumbs />
      <ServiceBaysList />
    </>
  );
}