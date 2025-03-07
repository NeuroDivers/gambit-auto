
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StaffDetailsFormProps {
  profileId: string;
  profileData: any;
  onSaved: () => void;
  role?: any;
}

export function StaffDetailsForm({ profileId, profileData, onSaved, role }: StaffDetailsFormProps) {
  const form = useForm({
    defaultValues: {
      first_name: profileData?.first_name || '',
      last_name: profileData?.last_name || '',
      phone_number: profileData?.phone_number || '',
      bio: profileData?.bio || '',
      unit_number: profileData?.unit_number || '',
      street_address: profileData?.street_address || '',
      city: profileData?.city || '',
      state_province: profileData?.state_province || '',
      postal_code: profileData?.postal_code || '',
      country: profileData?.country || '',
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profileId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      onSaved();
    },
    onError: (error: any) => {
      toast.error(`Error updating profile: ${error.message}`);
    }
  });

  const onSubmit = (formData: any) => {
    updateProfileMutation.mutate(formData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FormLabel>First Name</FormLabel>
          <Input {...form.register('first_name')} />
        </div>
        
        <div className="space-y-2">
          <FormLabel>Last Name</FormLabel>
          <Input {...form.register('last_name')} />
        </div>
      </div>

      <div className="space-y-2">
        <FormLabel>Phone Number</FormLabel>
        <Input {...form.register('phone_number')} />
      </div>

      <div className="space-y-2">
        <FormLabel>Bio</FormLabel>
        <Textarea 
          {...form.register('bio')} 
          placeholder="Tell us about yourself"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address Information</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FormLabel>Unit/Apt #</FormLabel>
            <Input {...form.register('unit_number')} placeholder="Unit/Apt #" />
          </div>
          
          <div className="space-y-2 md:col-span-1">
            <FormLabel>Street Address</FormLabel>
            <Input {...form.register('street_address')} placeholder="Street address" />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FormLabel>City</FormLabel>
            <Input {...form.register('city')} placeholder="City" />
          </div>
          
          <div className="space-y-2">
            <FormLabel>State/Province</FormLabel>
            <Input {...form.register('state_province')} placeholder="State/Province" />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <FormLabel>Postal Code</FormLabel>
            <Input {...form.register('postal_code')} placeholder="Postal code" />
          </div>
          
          <div className="space-y-2">
            <FormLabel>Country</FormLabel>
            <Input {...form.register('country')} placeholder="Country" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSaved}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
