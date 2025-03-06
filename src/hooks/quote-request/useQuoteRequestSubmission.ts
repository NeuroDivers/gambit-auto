
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ServiceFormData, ServiceItemType } from '@/types/service-item';

export function useQuoteRequestSubmission() {
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (formData: ServiceFormData) => {
      if (!user?.id) {
        throw new Error('You must be logged in to submit a quote request');
      }

      // Check if we need to save the vehicle to the user's account first
      let vehicleId = null;
      if (formData.vehicleInfo && formData.vehicleInfo.saveToAccount) {
        // Save vehicle to database
        const { data: vehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            customer_id: user.id,
            make: formData.vehicleInfo.make,
            model: formData.vehicleInfo.model,
            year: formData.vehicleInfo.year,
            vin: formData.vehicleInfo.vin,
            color: formData.vehicleInfo.color,
            is_primary: false,
          })
          .select('id')
          .single();

        if (vehicleError) {
          console.error('Error saving vehicle:', vehicleError);
          throw new Error('Failed to save vehicle to your account');
        }

        vehicleId = vehicle.id;
      }

      // Prepare service IDs array
      const serviceIds = formData.service_items?.map(item => {
        if (typeof item === 'string') {
          return item;
        }
        return (item as ServiceItemType).service_id;
      }) || [];

      // Insert quote request
      const { data, error } = await supabase
        .from('estimate_requests')
        .insert({
          customer_id: user.id,
          vehicle_make: formData.vehicleInfo?.make,
          vehicle_model: formData.vehicleInfo?.model,
          vehicle_year: formData.vehicleInfo?.year,
          vehicle_vin: formData.vehicleInfo?.vin,
          description: formData.description,
          service_ids: serviceIds,
          service_details: formData.service_details || {},
          status: 'pending',
          media_urls: formData.images || [],
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error submitting quote request:', error);
        throw new Error('Failed to submit quote request');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Quote request submitted successfully!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  return mutation;
}
