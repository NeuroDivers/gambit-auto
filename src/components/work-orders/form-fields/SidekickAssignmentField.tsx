
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { useAssignableProfiles } from "@/components/service-bays/hooks/useAssignableProfiles"
import { Badge } from "@/components/ui/badge"
import { ServiceItemType } from "@/types/service-item"

type SidekickAssignmentFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

interface DatabaseStaffSkill {
  profile_id: string
  service_id: string
  service_types: {
    name: string
    description: string | null
  }[]
}

export function SidekickAssignmentField({ form }: SidekickAssignmentFieldProps) {
  const { profiles = [] } = useAssignableProfiles()
  
  // Get the selected services from the form with proper typing
  const selectedServices = form.watch('service_items') as ServiceItemType[] || []
  const serviceIds = selectedServices.map(service => service.service_id)

  // Query staff skills
  const { data: staffSkills = {} } = useQuery({
    queryKey: ['staff-skills', serviceIds],
    queryFn: async () => {
      if (!serviceIds.length) return {}

      const { data: rawData, error } = await supabase
        .from('staff_service_skills')
        .select(`
          profile_id,
          service_id,
          service_types (
            name,
            description
          )
        `)
        .in('service_id', serviceIds)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching staff skills:', error)
        throw error
      }

      // Ensure the data matches our expected type
      const data = rawData.map(item => ({
        profile_id: item.profile_id,
        service_id: item.service_id,
        service_types: item.service_types as DatabaseStaffSkill['service_types']
      }))

      // Group skills by profile_id
      return data.reduce((acc: Record<string, { serviceId: string, serviceName: string }[]>, skill) => {
        if (!acc[skill.profile_id]) {
          acc[skill.profile_id] = []
        }
        // Get the first service type if it exists
        const serviceType = skill.service_types[0]
        acc[skill.profile_id].push({
          serviceId: skill.service_id,
          serviceName: serviceType?.name || 'Unknown Service'
        })
        return acc
      }, {})
    },
    enabled: serviceIds.length > 0
  })

  return (
    <FormField
      control={form.control}
      name="assigned_profile_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign User</FormLabel>
          <FormControl>
            <Select
              value={field.value || "unassigned"}
              onValueChange={(value) => {
                field.onChange(value === "unassigned" ? null : value)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  None
                </SelectItem>
                {profiles.map((profile) => {
                  const userSkills = staffSkills[profile.id] || []
                  const matchedSkills = userSkills.filter(skill => 
                    serviceIds.includes(skill.serviceId)
                  )
                  
                  return (
                    <SelectItem 
                      key={profile.id} 
                      value={profile.id}
                      className="flex flex-col items-start"
                    >
                      <div className="flex flex-col gap-1">
                        <span>{`${profile.first_name || ''} ${profile.last_name || ''}`}</span>
                        {matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {matchedSkills.map(skill => (
                              <Badge 
                                key={skill.serviceId}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill.serviceName}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  )
}
