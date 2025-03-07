
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_number: z.string().optional(),
  bio: z.string().optional(),
  street_address: z.string().optional(),
  unit_number: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

export type StaffDetailsFormData = z.infer<typeof formSchema>;

export interface StaffDetailsFormProps {
  profileId: string;
  profileData?: any;
  staffDetails?: any;
  onClose?: () => void;
  onSaved?: () => void;
  role?: string;
  refetch?: () => void;
}

export function StaffDetailsForm({
  profileId,
  profileData,
  staffDetails,
  onClose,
  onSaved,
  role,
  refetch
}: StaffDetailsFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<StaffDetailsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: profileData?.first_name || staffDetails?.first_name || '',
      last_name: profileData?.last_name || staffDetails?.last_name || '',
      phone_number: profileData?.phone_number || staffDetails?.phone_number || '',
      bio: profileData?.bio || staffDetails?.bio || '',
      street_address: profileData?.street_address || staffDetails?.street_address || '',
      unit_number: profileData?.unit_number || staffDetails?.unit_number || '',
      city: profileData?.city || staffDetails?.city || '',
      state_province: profileData?.state_province || staffDetails?.state_province || '',
      postal_code: profileData?.postal_code || staffDetails?.postal_code || '',
      country: profileData?.country || staffDetails?.country || '',
    }
  });

  const onSubmit = async (values: StaffDetailsFormData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          phone_number: values.phone_number,
          bio: values.bio,
          street_address: values.street_address,
          unit_number: values.unit_number,
          city: values.city,
          state_province: values.state_province,
          postal_code: values.postal_code,
          country: values.country,
        })
        .eq('id', profileId);

      if (error) throw error;

      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-profile', profileId] });
      queryClient.invalidateQueries({ queryKey: ['staff-details', profileId] });
      
      if (onSaved) onSaved();
      if (onClose) onClose();
      if (refetch) refetch();
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Bio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="street_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Unit Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state_province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="State/Province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              {onClose && (
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
