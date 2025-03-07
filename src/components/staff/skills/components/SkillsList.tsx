
import React from "react";
import { StaffSkill } from "../types";
import { SkillCard } from "./SkillCard";

export interface SkillsListProps {
  skills: StaffSkill[];
  onUpdate: (skillId: string, level: string) => void;
  onDelete: (skillId: string) => void;
}

export function SkillsList({ skills, onUpdate, onDelete }: SkillsListProps) {
  return (
    <div className="space-y-4">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
