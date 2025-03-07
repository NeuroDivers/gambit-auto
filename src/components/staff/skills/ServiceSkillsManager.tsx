
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStaffSkills } from "./hooks/useStaffSkills";
import SkillForm from "./components/SkillForm";
import { SkillsList } from "./components/SkillsList";
import { Plus } from "lucide-react";

interface ServiceSkillsManagerProps {
  profileId: string;
  isCurrentUser?: boolean;
}

export function ServiceSkillsManager({ profileId, isCurrentUser = false }: ServiceSkillsManagerProps) {
  const { 
    skills, 
    serviceTypes, 
    isLoading, 
    isAddingSkill,
    setIsAddingSkill,
    handleAddSkill,
    handleUpdateSkill,
    handleDeleteSkill
  } = useStaffSkills(profileId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <p>Loading skills...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Service Skills</CardTitle>
        {isCurrentUser && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingSkill(true)}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Skill
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAddingSkill && (
          <div className="mb-6">
            <SkillForm
              serviceTypes={serviceTypes}
              onSubmit={(serviceTypeId, level) => handleAddSkill(serviceTypeId, level)}
              onCancel={() => setIsAddingSkill(false)}
            />
          </div>
        )}

        {skills.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            No skills added yet
          </div>
        ) : (
          <SkillsList 
            skills={skills} 
            onUpdate={(skillId, level) => handleUpdateSkill(skillId, level)} 
            onDelete={(skillId) => handleDeleteSkill(skillId)}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default ServiceSkillsManager;
