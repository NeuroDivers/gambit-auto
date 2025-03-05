import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ServiceFormData } from '@/types/service-item';

export function useFormStorage(formKey: string) {
  const methods = useForm<ServiceFormData>({
    defaultValues: {
      serviceType: '',
      details: {},
      images: [],
      description: '',
      vehicleInfo: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        saveToAccount: false
      },
      service_items: [],
      service_details: {}
    }
  });
  const { setValue, getValues } = methods;

  const storageKey = `form-storage-${formKey}`;

  const saveFormToStorage = useCallback(() => {
    const values = getValues();
    localStorage.setItem(storageKey, JSON.stringify(values));
  }, [getValues, storageKey]);

  useEffect(() => {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      Object.keys(parsedData).forEach((key) => {
        setValue(key as keyof ServiceFormData, parsedData[key]);
      });
    }
  }, [setValue, storageKey]);

  useEffect(() => {
    window.addEventListener('beforeunload', saveFormToStorage);
    return () => {
      window.removeEventListener('beforeunload', saveFormToStorage);
    };
  }, [saveFormToStorage]);

  return methods;
}
