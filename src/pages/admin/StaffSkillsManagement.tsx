
import { ServiceSkillsManager } from "@/components/staff/skills/ServiceSkillsManager"
import { PageTitle } from "@/components/shared/PageTitle"
import { Card } from "@/components/ui/card"

export default function StaffSkillsManagement() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Staff Skills Management"
        description="Manage service qualifications and expertise for all staff members"
      />
      <Card className="p-6">
        <ServiceSkillsManager />
      </Card>
    </div>
  )
}
