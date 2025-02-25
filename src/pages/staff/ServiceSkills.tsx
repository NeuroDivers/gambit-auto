
import { ServiceSkillsManager } from "@/components/staff/skills/ServiceSkillsManager"
import { PageTitle } from "@/components/shared/PageTitle"
import { Card } from "@/components/ui/card"

export default function ServiceSkills() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle>My Service Skills</PageTitle>
      <Card className="p-6">
        <ServiceSkillsManager />
      </Card>
    </div>
  )
}
