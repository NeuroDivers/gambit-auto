
import { ServiceSkillsManager } from "@/components/staff/skills/ServiceSkillsManager"
import { PageTitle } from "@/components/shared/PageTitle"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

export default function ServiceSkills() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="My Service Skills"
        description="Manage your service qualifications and expertise"
      />
      <Card className="p-6">
        {user && user.id ? (
          <ServiceSkillsManager profileId={user.id} />
        ) : (
          <p>Loading user profile...</p>
        )}
      </Card>
    </div>
  )
}
