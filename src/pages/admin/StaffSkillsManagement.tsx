
import { ServiceSkillsManager } from "@/components/staff/skills/ServiceSkillsManager"
import { PageTitle } from "@/components/shared/PageTitle"
import { Card } from "@/components/ui/card"
import { useUserData } from "@/components/users/hooks/useUserData"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function StaffSkillsManagement() {
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const { data: users, isLoading } = useUserData()

  // Filter out client users, we only want staff
  const staffUsers = users?.filter(user => 
    user.role?.name !== 'client'
  ) || []

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle 
        title="Staff Skills Management"
        description="Manage service qualifications and expertise for all staff members"
      />
      
      <Card className="p-4">
        <div className="space-y-2">
          <label htmlFor="user-select" className="text-sm font-medium">
            Select Staff Member
          </label>
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
          >
            <SelectTrigger id="user-select" className="w-[300px]">
              <SelectValue placeholder="Select a staff member" />
            </SelectTrigger>
            <SelectContent>
              {staffUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.role?.nicename})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {selectedUserId && (
        <Card className="p-6">
          <ServiceSkillsManager profileId={selectedUserId} />
        </Card>
      )}

      {!selectedUserId && (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Please select a staff member to manage their skills
          </p>
        </Card>
      )}
    </div>
  )
}
