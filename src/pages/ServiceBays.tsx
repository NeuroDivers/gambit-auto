import { ServiceBaysList } from "@/components/service-bays/ServiceBaysList";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";

export default function ServiceBays() {
  return (
    <DashboardLayout>
      <PageBreadcrumbs />
      <ServiceBaysList />
    </DashboardLayout>
  );
}