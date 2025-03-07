import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface StaffCommissionRatesProps {
  profileId: string;
  form?: any;
}

export function StaffCommissionRates({ profileId }: StaffCommissionRatesProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Commission Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Commission rates for staff member ID: {profileId}</p>
        {/* Commission rates content would go here */}
      </CardContent>
    </Card>
  );
}
