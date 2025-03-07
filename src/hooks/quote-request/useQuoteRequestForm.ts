
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ServiceFormData, ServiceItemType } from '@/types/service-item';
import { useQuoteRequestSubmission } from './useQuoteRequestSubmission';

export interface QuoteRequestFormContextType {
  form: ReturnType<typeof useForm<ServiceFormData>>;
  step: number;
  totalSteps: number;
  services: ServiceItemType[];
  isSubmitting: boolean;
  uploading: boolean;
  handleSubmit: (data: ServiceFormData) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleImageUpload: (file: File) => Promise<string>;
  handleImageRemove: (url: string) => void;
  onVehicleSave: (vehicleId: string) => void;
  selectedServiceId: string | null;
}

export function useQuoteRequestForm() {
  const [step, setStep] = useState(1);
  const [totalSteps] = useState(3);
  const [services, setServices] = useState<ServiceItemType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  const form = useForm<ServiceFormData>({
    defaultValues: {
      vehicleInfo: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        color: '',
      },
      service_items: [],
      description: '',
      service_details: {},
    },
  });

  const mutation = useQuoteRequestSubmission();
  const isSubmitting = mutation.isPending;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (data: ServiceFormData) => {
    mutation.mutate(data);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    // Simulation of upload - in a real app, you would upload to your storage
    return new Promise((resolve) => {
      setTimeout(() => {
        setUploading(false);
        resolve(URL.createObjectURL(file));
      }, 1000);
    });
  };

  const handleImageRemove = (url: string) => {
    // Handle image removal logic
    console.log('Removing image:', url);
  };

  const onVehicleSave = (vehicleId: string) => {
    console.log('Vehicle saved with ID:', vehicleId);
  };

  return {
    form,
    step,
    totalSteps,
    services,
    isSubmitting,
    uploading,
    handleSubmit,
    nextStep,
    prevStep,
    handleImageUpload,
    handleImageRemove,
    onVehicleSave,
    selectedServiceId,
  };
}
