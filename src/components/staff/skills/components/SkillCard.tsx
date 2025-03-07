
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffSkill } from "../types";

interface SkillCardProps {
  skill: StaffSkill;
  onRemove: (skillId: string) => void;
  isRemoving: boolean;
}

export function SkillCard({ skill, onRemove, isRemoving }: SkillCardProps) {
  return (
    <Card key={skill.id}>
      <CardContent className="flex justify-between items-center p-4">
        <div>
          <h4 className="font-medium">{skill.service_types.name}</h4>
          <p className="text-sm text-muted-foreground capitalize">{skill.proficiency}</p>
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onRemove(skill.id)}
          disabled={isRemoving}
        >
          Remove
        </Button>
      </CardContent>
    </Card>
  );
}
