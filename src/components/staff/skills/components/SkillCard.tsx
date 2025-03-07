
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaffSkill } from "../types";
import { Trash } from "lucide-react";

export interface SkillCardProps {
  skill: StaffSkill;
  onRemove: (skillId: string) => void;
  isRemoving?: boolean;
  onUpdate?: (skillId: string, level: string) => void;
}

export function SkillCard({ skill, onRemove, isRemoving, onUpdate }: SkillCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium">{skill.serviceName}</h3>
            <p className="text-sm text-muted-foreground">
              Expertise: {skill.expertiseLevel || 'Beginner'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(skill.id)}
            disabled={isRemoving}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="Remove skill"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SkillCard;
