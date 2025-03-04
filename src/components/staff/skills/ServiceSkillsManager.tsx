
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminStatus } from "@/hooks/useAdminStatus"

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
  const { isAdmin } = useAdminStatus()
  const [permissionError, setPermissionError] = useState(false)
  
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  // Check if current user has permission to manage the specified profile's skills
  const hasPermission = !!currentUser && (
    isAdmin || 
    !profileId || // Managing own skills
    currentUser.id === profileId // Managing own skills with profileId specified
  )

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
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      // Set permission error state if it's an RLS policy violation
      if (error.message?.includes('row-level security')) {
        setPermissionError(true)
      }
    }
  })

  const { data: skills, isLoading, error: fetchError } = useQuery({
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

      if (skillsError) {
        console.error('Skills fetch error:', skillsError)
        // Check if this is a permissions error
        if (skillsError.message?.includes('row-level security')) {
          setPermissionError(true)
        }
        // Still continue with available services but mark as not active
        return services.map(service => ({
          id: '',
          service_id: service.id,
          is_active: false,
          service_types: {
            name: service.name,
            description: service.description
          }
        }))
      }

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

  useEffect(() => {
    // Reset permission error if user/profileId changes
    setPermissionError(false)
  }, [currentUser, profileId])

  const toggleSkill = async (serviceId: string, currentStatus: boolean, skillId: string) => {
    if (!hasPermission) {
      toast.error("You don't have permission to manage these skills")
      return
    }

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

  if (permissionError) {
    return (
      <div className="p-6 space-y-4 border rounded-lg bg-destructive/10 border-destructive/20">
        <div className="flex items-center gap-2 text-destructive font-medium">
          <AlertTriangle size={18} />
          <h3>Permission Error</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          You don't have permission to manage service skills for this user. 
          Only administrators or the user themselves can manage service skills.
        </p>
      </div>
    )
  }

  if (fetchError && !permissionError) {
    return (
      <div className="p-6 space-y-4 border rounded-lg bg-destructive/10 border-destructive/20">
        <div className="flex items-center gap-2 text-destructive font-medium">
          <AlertTriangle size={18} />
          <h3>Error Loading Skills</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          There was an error loading service skills. Please try again later.
        </p>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['service-skills'] })}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!hasPermission && (
        <div className="mb-4 p-4 border rounded-lg bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
            <Shield size={18} />
            <h3>Viewing Only</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            You can view but not modify these service skills. Only administrators or the user themselves can make changes.
          </p>
        </div>
      )}

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
              disabled={!hasPermission}
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
