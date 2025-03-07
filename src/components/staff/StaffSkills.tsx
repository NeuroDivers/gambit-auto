
import { useState } from 'react';
import { PageTitle } from '@/components/shared/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceSkillsManager } from './skills/ServiceSkillsManager';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRemoveSkillMutation } from '@/components/staff/hooks/useRemoveSkillMutation';

function MySkills() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Service Skills</CardTitle>
        <CardDescription>
          Manage your service skills to let customers know what services you can provide
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ServiceSkillsManager />
      </CardContent>
    </Card>
  );
}

function StaffSkillsDirectory() {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { removeSkill, isLoading: removeSkillLoading } = useRemoveSkillMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-skills'] });
    }
  });

  const { data: staffMembers, isLoading: staffLoading } = useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .not('role_id', 'is', null)
        .order('first_name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: staffSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ['staff-skills', selectedStaff],
    queryFn: async () => {
      if (!selectedStaff) return null;
      
      const { data, error } = await supabase
        .from('staff_service_skills')
        .select(`
          id,
          staff_id,
          service_id,
          proficiency_level,
          service_types:service_id (
            id,
            name,
            description
          ),
          profiles:staff_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('staff_id', selectedStaff);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStaff
  });

  const { data: availableServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['available-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedStaff
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const addSkillsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStaff || selectedSkills.length === 0) return;
      
      // Check which skills are not already added
      const existingSkillIds = staffSkills?.map(skill => skill.service_id) || [];
      const newSkillIds = selectedSkills.filter(id => !existingSkillIds.includes(id));
      
      if (newSkillIds.length === 0) {
        toast.info("All selected skills are already added");
        return;
      }
      
      // Create entries for new skills
      const skillsToAdd = newSkillIds.map(serviceId => ({
        staff_id: selectedStaff,
        service_id: serviceId,
        proficiency_level: 'beginner'
      }));
      
      const { error } = await supabase
        .from('staff_service_skills')
        .insert(skillsToAdd);
      
      if (error) throw error;
      
      toast.success(`${newSkillIds.length} skill${newSkillIds.length > 1 ? 's' : ''} added successfully`);
      setSelectedSkills([]);
      queryClient.invalidateQueries({ queryKey: ['staff-skills'] });
    }
  });

  // Filter out services that the staff member already has
  const availableServicesToAdd = availableServices?.filter(service => 
    !staffSkills?.some(skill => skill.service_id === service.id)
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Skills Directory</CardTitle>
        <CardDescription>
          View and manage skills for all staff members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Staff selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Staff Member</h3>
            {staffLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-24" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {staffMembers?.map(staff => (
                  <Badge
                    key={staff.id}
                    variant={selectedStaff === staff.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedStaff(staff.id);
                      setSelectedSkills([]);
                    }}
                  >
                    {staff.first_name} {staff.last_name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Skills display */}
          {selectedStaff && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Current Skills</h3>
                {skillsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                ) : staffSkills?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No skills added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {staffSkills?.map(skill => (
                      <Badge 
                        key={skill.id} 
                        variant="secondary"
                        className="pl-3 pr-2 py-1.5 text-sm flex items-center gap-1"
                      >
                        {skill.service_types?.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full ml-1 hover:bg-destructive/10"
                          onClick={() => removeSkill(skill.id)}
                          disabled={removeSkillLoading}
                        >
                          <X size={12} />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Add skills section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Add New Skills</h3>
                  <Button 
                    size="sm"
                    onClick={() => addSkillsMutation.mutate()}
                    disabled={selectedSkills.length === 0 || addSkillsMutation.isPending}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Selected
                  </Button>
                </div>
                
                {servicesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : availableServicesToAdd.length === 0 ? (
                  <p className="text-muted-foreground text-sm">All available skills have been added</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {availableServicesToAdd.map(service => (
                      <div
                        key={service.id}
                        className={`
                          border rounded-md p-2 cursor-pointer text-sm
                          ${selectedSkills.includes(service.id) 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'hover:bg-muted'
                          }
                        `}
                        onClick={() => {
                          setSelectedSkills(prev => 
                            prev.includes(service.id)
                              ? prev.filter(id => id !== service.id)
                              : [...prev, service.id]
                          );
                        }}
                      >
                        {service.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServiceSkills() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageTitle title="Service Skills" />
      
      <Tabs defaultValue="my-skills">
        <TabsList>
          <TabsTrigger value="my-skills">My Skills</TabsTrigger>
          <TabsTrigger value="staff-skills">Staff Skills</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-skills" className="mt-6">
          <MySkills />
        </TabsContent>
        
        <TabsContent value="staff-skills" className="mt-6">
          <StaffSkillsDirectory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
