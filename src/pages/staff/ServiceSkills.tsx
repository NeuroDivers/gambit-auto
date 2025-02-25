
import { ServiceSkillsManager } from "@/components/staff/skills/ServiceSkillsManager"
import { PageTitle } from "@/components/shared/PageTitle"
import { Card } from "@/components/ui/card"

export default function ServiceSkills() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="My Service Skills"
        description="Manage your service qualifications and expertise"
      />
      <Card className="p-6">
        <ServiceSkillsManager />
      </Card>
    </div>
  )
}
