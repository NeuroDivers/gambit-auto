
import { PageTitle } from "@/components/shared/PageTitle"
import { ServiceSkillsManager } from "@/components/staff/skills/ServiceSkillsManager"

export default function ServiceSkills() {
  return (
    <div className="container mx-auto p-6">
      <PageTitle 
        title="Service Skills" 
        description="Manage the services you're qualified to perform"
      />
      <div className="mt-6">
        <ServiceSkillsManager />
      </div>
    </div>
  )
}
