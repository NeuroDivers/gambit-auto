
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ServiceDetailFieldProps } from './types';

export function WindowTintField({ value, onChange }: ServiceDetailFieldProps) {
  const handleTintOptionChange = (selectedOption: string) => {
    onChange({
      ...value,
      tintOption: selectedOption
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium mb-2 block">Window Tint Options</Label>
        <RadioGroup
          value={value?.tintOption || 'full'}
          onValueChange={handleTintOptionChange}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="full-tint" />
            <Label htmlFor="full-tint" className="font-normal">Full Window Tint (All Windows)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="front-only" id="front-only" />
            <Label htmlFor="front-only" className="font-normal">Front Windows Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="back-only" id="back-only" />
            <Label htmlFor="back-only" className="font-normal">Back Windows Only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom-tint" />
            <Label htmlFor="custom-tint" className="font-normal">Custom (Specify in description)</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
