
import React from 'react';
import { ServiceSkillsManager } from './skills/ServiceSkillsManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface StaffSkillsProps {
  profileId: string;
}

export default function StaffSkills({ profileId }: StaffSkillsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Service Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <ServiceSkillsManager profileId={profileId} />
      </CardContent>
    </Card>
  );
}
