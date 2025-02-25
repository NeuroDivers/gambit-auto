
import { useState } from "react"
import { PageTitle } from "@/components/shared/PageTitle"
import { ServiceSkillsManager } from "@/components/staff/skills/ServiceSkillsManager"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"

export default function StaffSkills() {
  const [selectedStaff, setSelectedStaff] = useState<string>("")

  const { data: staffMembers } = useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          roles:role_id (
            name
          )
        `)
        .not('roles.name', 'eq', 'client')
        .order('first_name')

      if (error) throw error
      return data
    }
  })

  return (
    <div className="container mx-auto p-6">
      <PageTitle 
        title="Staff Skills Management" 
        description="Manage service skills for staff members"
      />
      
      <Card className="mt-6 p-4">
        <Select
          value={selectedStaff}
          onValueChange={setSelectedStaff}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a staff member" />
          </SelectTrigger>
          <SelectContent>
            {staffMembers?.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.first_name} {staff.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {selectedStaff && (
        <div className="mt-6">
          <ServiceSkillsManager profileId={selectedStaff} />
        </div>
      )}
    </div>
  )
}
