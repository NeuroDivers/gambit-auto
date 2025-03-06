
import React from 'react';
import { FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PackageSelectProps {
  packages: any[];
  value: string;
  packageName: string | null;
  onValueChange: (value: string) => void;
}

export function PackageSelect({ packages, value, packageName, onValueChange }: PackageSelectProps) {
  if (packages.length === 0) return null;

  return (
    <div className="mt-2">
      <FormItem>
        <FormLabel>Package</FormLabel>
        <Select
          value={value}
          onValueChange={onValueChange}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select a package">
                {packageName || "Select a package"}
              </SelectValue>
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {packages.map((pkg: any) => (
              <SelectItem key={pkg.id} value={pkg.id}>
                {pkg.name} {pkg.price ? `- $${pkg.price}` : pkg.sale_price ? `- $${pkg.sale_price}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>
    </div>
  );
}
