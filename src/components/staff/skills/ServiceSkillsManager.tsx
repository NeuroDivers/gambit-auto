
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRemoveSkillMutation } from '../hooks/useRemoveSkillMutation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export interface ServiceSkillsManagerProps {
  profileId: string;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
}

interface StaffSkill {
  id: string;
  service_id: string;
  proficiency: string;
  service_types: ServiceType;
}

export function ServiceSkillsManager({ profileId }: ServiceSkillsManagerProps) {
  const { user } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [proficiency, setProficiency] = useState<string>('beginner');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const { removeSkill, isLoading: isRemoving } = useRemoveSkillMutation();

  // Fetch available services
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['service-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user's current skills
  const { data: userSkills, isLoading: isLoadingSkills, refetch: refetchSkills } = useQuery({
    queryKey: ['profile-skills', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_service_skills')
        .select(`
          id,
          service_id,
          proficiency,
          service_types (
            id,
            name,
            description
          )
        `)
        .eq('profile_id', profileId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId
  });

  const handleAddSkill = async () => {
    if (!selectedServiceId) {
      toast.error('Please select a service');
      return;
    }

    // Check if the skill already exists
    const existingSkill = userSkills?.find(skill => skill.service_id === selectedServiceId);
    if (existingSkill) {
      toast.error('You already have this skill added');
      return;
    }

    setIsAddingSkill(true);
    try {
      const { error } = await supabase
        .from('staff_service_skills')
        .insert({
          profile_id: profileId,
          service_id: selectedServiceId,
          proficiency: proficiency
        });

      if (error) throw error;
      
      toast.success('Skill added successfully');
      refetchSkills();
      setSelectedServiceId('');
      setProficiency('beginner');
    } catch (error: any) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill: ' + error.message);
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    removeSkill(skillId, {
      onSuccess: () => {
        refetchSkills();
      }
    });
  };

  // Filter out services that the user already has
  const availableServices = services?.filter(service => 
    !userSkills?.some(skill => skill.service_id === service.id)
  );

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Add New Skill</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service</label>
            <Select 
              value={selectedServiceId} 
              onValueChange={setSelectedServiceId}
              disabled={isLoadingServices || isAddingSkill}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {availableServices?.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Proficiency</label>
            <Select 
              value={proficiency} 
              onValueChange={setProficiency}
              disabled={isAddingSkill}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleAddSkill} 
              disabled={!selectedServiceId || isAddingSkill}
              className="w-full md:w-auto"
            >
              {isAddingSkill ? 'Adding...' : 'Add Skill'}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Your Skills</h3>
        {isLoadingSkills ? (
          <p>Loading skills...</p>
        ) : userSkills?.length === 0 ? (
          <p className="text-muted-foreground">You haven't added any skills yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userSkills?.map(skill => (
              <Card key={skill.id}>
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <h4 className="font-medium">{skill.service_types?.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{skill.proficiency}</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemoveSkill(skill.id)}
                    disabled={isRemoving}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
