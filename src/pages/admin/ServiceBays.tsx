
import { PageTitle } from "@/components/shared/PageTitle"
import { ServiceBaysList } from "@/components/service-bays/ServiceBaysList"

export default function ServiceBays() {
  return (
    <div className="container py-8 space-y-6">
      <PageTitle 
        title="Service Bays" 
        description="Manage your service bays and assignments"
      />
      <ServiceBaysList />
    </div>
  )
}
