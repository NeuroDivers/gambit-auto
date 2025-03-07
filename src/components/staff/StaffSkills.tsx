import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Skill {
  id: string;
  name: string;
}

export function StaffSkills({ profileId }: { profileId: string }) {
  const [newSkill, setNewSkill] = useState("");
  const queryClient = useQueryClient();

  const { data: staffSkills, isLoading: isLoadingStaffSkills, refetch: refetchStaffSkills } = useQuery({
    queryKey: ["staffSkills", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_skills")
        .select("skill_id")
        .eq("profile_id", profileId);

      if (error) {
        console.error("Error fetching staff skills:", error);
        throw error;
      }

      return data?.map(item => item.skill_id) || [];
    },
  });

  const { data: serviceTypes = [], isLoading: isLoadingServiceTypes } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("id, name, description");

      if (error) {
        console.error("Error fetching service types:", error);
        throw error;
      }

      return data || [];
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from("staff_skills")
        .insert([{ profile_id: profileId, skill_id: skillId }]);

      if (error) {
        console.error("Error adding skill:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Skill added successfully!");
      queryClient.invalidateQueries({ queryKey: ["staffSkills", profileId] });
      setNewSkill("");
    },
    onError: (error: any) => {
      toast.error(`Failed to add skill: ${error.message}`);
    },
  });

  const removeSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from("staff_skills")
        .delete()
        .eq("profile_id", profileId)
        .eq("skill_id", skillId);

      if (error) {
        console.error("Error removing skill:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Skill removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["staffSkills", profileId] });
    },
    onError: (error: any) => {
      toast.error(`Failed to remove skill: ${error.message}`);
    },
  });

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await addSkillMutation.mutateAsync(newSkill);
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await removeSkillMutation.mutateAsync(skillId);
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  };

  if (isLoadingStaffSkills || isLoadingServiceTypes) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Skills</h3>
      <Table>
        <TableCaption>A list of skills assigned to this staff member.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Skill</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffSkills?.map((skillId) => {
            const service = serviceTypes.find(s => s.id === skillId);
            return (
              <TableRow key={skillId}>
                <TableCell className="font-medium">{serviceTypes.find(s => s.id === service.id)?.name}</TableCell>
                <TableCell>{serviceTypes.find(s => s.id === service.id)?.description}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSkill(skillId)}
                  >
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>
              <div className="flex items-center space-x-2">
                <Select onValueChange={setNewSkill}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddSkill} disabled={addSkillMutation.isLoading}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
