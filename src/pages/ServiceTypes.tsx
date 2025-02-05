import { ServiceTypesList } from "@/components/services/ServiceTypesList";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";

export default function ServiceTypes() {
  return (
    <DashboardLayout>
      <PageBreadcrumbs />
      <ServiceTypesList />
    </DashboardLayout>
  );
}