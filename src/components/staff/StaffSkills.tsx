
import React from 'react';
import { ServiceSkillsManager } from './skills/ServiceSkillsManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StaffSkills() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Service Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <ServiceSkillsManager />
      </CardContent>
    </Card>
  );
}
