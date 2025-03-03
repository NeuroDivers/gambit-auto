
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { toast } from "sonner"

interface ServiceSkill {
  id: string
  service_id: string
  is_active: boolean
  service_types: {
    name: string
    description: string | null
  }
}

interface ServiceSkillsManagerProps {
  profileId?: string // Optional - if not provided, manages current user's skills
}

export function ServiceSkillsManager({ profileId }: ServiceSkillsManagerProps) {
  const queryClient = useQueryClient()
  
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  // Use mutation instead of direct function call for better error handling
  const updateSkillMutation = useMutation({
    mutationFn: async ({ 
      skillId, 
      targetId, 
      serviceId, 
      isActive 
    }: { 
      skillId: string; 
      targetId: string; 
      serviceId: string; 
      isActive: boolean 
    }) => {
      if (skillId) {
        // Update existing skill
        const { error } = await supabase
          .from('staff_service_skills')
          .update({ is_active: !isActive })
          .eq('id', skillId)

        if (error) throw error
      } else {
        // Create new skill
        const { error } = await supabase
          .from('staff_service_skills')
          .insert({
            profile_id: targetId,
            service_id: serviceId,
            is_active: true
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-skills'] })
    }
  })

  const { data: skills, isLoading } = useQuery({
    queryKey: ['service-skills', profileId || currentUser?.id],
    queryFn: async () => {
      const targetId = profileId || currentUser?.id
      if (!targetId) return []

      // First get all services
      const { data: services, error: servicesError } = await supabase
        .from('service_types')
        .select('id, name, description')
        .eq('status', 'active')

      if (servicesError) throw servicesError

      // Then get user's active skills
      const { data: userSkills, error: skillsError } = await supabase
        .from('staff_service_skills')
        .select(`
          id,
          service_id,
          is_active,
          service_types (
            name,
            description
          )
        `)
        .eq('profile_id', targetId)

      if (skillsError) throw skillsError

      // Map services to include skill status
      return services.map(service => {
        const existingSkill = userSkills?.find(skill => skill.service_id === service.id)
        return {
          id: existingSkill?.id || '',
          service_id: service.id,
          is_active: existingSkill?.is_active || false,
          service_types: {
            name: service.name,
            description: service.description
          }
        }
      })
    },
    enabled: !!currentUser || !!profileId
  })

  const toggleSkill = async (serviceId: string, currentStatus: boolean, skillId: string) => {
    try {
      const targetId = profileId || currentUser?.id
      if (!targetId) return

      const serviceName = skills?.find(skill => skill.service_id === serviceId)?.service_types.name

      await updateSkillMutation.mutateAsync({ 
        skillId, 
        targetId, 
        serviceId, 
        isActive: currentStatus 
      })

      // Show success toast with specific message
      const action = currentStatus ? "disabled" : "enabled"
      toast.success(`${serviceName} skill ${action}`, {
        description: `You have successfully ${action} this service skill.`
      })
    } catch (error) {
      console.error('Error updating skill:', error)
      toast.error("Failed to update skill", {
        description: "There was an error updating the service skill. Please try again."
      })
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="space-y-4">
      {skills?.map((skill) => (
        <Card key={skill.service_id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{skill.service_types.name}</h3>
              {skill.service_types.description && (
                <p className="text-sm text-muted-foreground">
                  {skill.service_types.description}
                </p>
              )}
            </div>
            <Switch
              checked={skill.is_active}
              onCheckedChange={() => toggleSkill(skill.service_id, skill.is_active, skill.id)}
            />
          </div>
        </Card>
      ))}
      {!skills?.length && (
        <p className="text-center text-muted-foreground">
          No services available.
        </p>
      )}
    </div>
  )
}
