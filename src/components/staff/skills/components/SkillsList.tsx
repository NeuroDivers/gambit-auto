
import { StaffSkill } from "../types";
import { SkillCard } from "./SkillCard";

interface SkillsListProps {
  skills: StaffSkill[];
  isLoading: boolean;
  onRemove: (skillId: string) => void;
  isRemoving?: boolean;
  onUpdate?: (skillId: string, level: string) => void;
}

export function SkillsList({ 
  skills, 
  isLoading, 
  onRemove, 
  isRemoving,
  onUpdate 
}: SkillsListProps) {
  if (isLoading) {
    return <p>Loading skills...</p>;
  }
  
  if (skills.length === 0) {
    return <p className="text-muted-foreground">You haven't added any skills yet.</p>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {skills.map(skill => (
        <SkillCard 
          key={skill.id} 
          skill={skill} 
          onRemove={onRemove} 
          isRemoving={isRemoving}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default SkillsList;
