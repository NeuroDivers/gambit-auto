
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useRemoveSkillMutation } from '@/components/staff/hooks/useRemoveSkillMutation'

export function ServiceSkillsManager() {
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // Fetch the current user's ID
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
      }
    }
    fetchUserId()
  }, [])

  // Fetch all available services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['serviceTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('status', 'active')
        .order('name')
      
      if (error) throw error
      return data || []
    },
    enabled: !!userId
  })

  // Fetch user's current skills
  const { 
    data: userSkills, 
    isLoading: skillsLoading,
    refetch: refetchUserSkills 
  } = useQuery({
    queryKey: ['userSkills', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('staff_service_skills')
        .select(`
          id,
          service_id,
          proficiency_level,
          service_types:service_id (
            id,
            name,
            description
          )
        `)
        .eq('staff_id', userId)
      
      if (error) throw error
      return data || []
    },
    enabled: !!userId
  })

  // Add new skills mutation
  const addSkillsMutation = useMutation({
    mutationFn: async () => {
      if (!userId || selectedSkillIds.length === 0) return
      
      // Check which skills are not already added
      const existingSkillIds = userSkills?.map(skill => skill.service_id) || []
      const newSkillIds = selectedSkillIds.filter(id => !existingSkillIds.includes(id))
      
      if (newSkillIds.length === 0) {
        toast.info("All selected skills are already added")
        return
      }
      
      // Create entries for new skills
      const skillsToAdd = newSkillIds.map(serviceId => ({
        staff_id: userId,
        service_id: serviceId,
        proficiency_level: 'beginner'
      }))
      
      const { error } = await supabase
        .from('staff_service_skills')
        .insert(skillsToAdd)
      
      if (error) throw error
      
      toast.success(`${newSkillIds.length} skill${newSkillIds.length > 1 ? 's' : ''} added successfully`)
      setSelectedSkillIds([])
      refetchUserSkills()
    }
  })

  // Remove skill mutation using the custom hook
  const removeSkillMutation = useRemoveSkillMutation({
    onSuccess: () => {
      refetchUserSkills()
    }
  })

  // Handle skill selection
  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkillIds(prev => 
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  // Handle removing a skill
  const handleRemoveSkill = (skillId: string) => {
    removeSkillMutation.removeSkill(skillId)
  }

  // Get available services (excluding ones the user already has)
  const availableServices = services?.filter(service => 
    !userSkills?.some(skill => skill.service_id === service.id)
  ) || []

  // Loading states
  if (!userId) {
    return <div>Loading user information...</div>
  }

  return (
    <div className="space-y-8">
      {/* User's current skills section */}
      <div>
        <h3 className="text-lg font-medium mb-4">My Skills</h3>
        
        {skillsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        ) : userSkills?.length === 0 ? (
          <p className="text-muted-foreground">You haven't added any service skills yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userSkills?.map(skill => (
              <Badge 
                key={skill.id} 
                variant="secondary"
                className="pl-3 pr-2 py-1.5 text-sm flex items-center gap-1"
              >
                {skill.service_types.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full ml-1 hover:bg-destructive/10"
                  onClick={() => handleRemoveSkill(skill.id)}
                  disabled={removeSkillMutation.isLoading || removeSkillMutation.isPending}
                >
                  <X size={12} />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Add new skills section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add New Skills</h3>
          <Button 
            size="sm"
            onClick={() => addSkillsMutation.mutate()}
            disabled={selectedSkillIds.length === 0 || addSkillsMutation.isPending}
          >
            <Plus size={16} className="mr-1" />
            Add Selected Skills
          </Button>
        </div>
        
        {servicesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        ) : availableServices.length === 0 ? (
          <p className="text-muted-foreground">
            You've added all available service skills.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {availableServices.map(service => (
              <div 
                key={service.id}
                className={`
                  border rounded-md p-3 cursor-pointer transition-colors
                  ${selectedSkillIds.includes(service.id) 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'hover:bg-muted'
                  }
                `}
                onClick={() => toggleSkillSelection(service.id)}
              >
                <div className="font-medium">{service.name}</div>
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
