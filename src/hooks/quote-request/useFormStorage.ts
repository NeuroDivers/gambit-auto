
import { useState, useCallback, useEffect } from 'react';
import { ServiceFormData } from '@/types/service-item';

export function useFormStorage() {
  const [formData, setFormData] = useState<ServiceFormData>(() => {
    const savedData = localStorage.getItem('quoteRequestForm');
    
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    
    return {
      service_type: '',
      vehicleInfo: {
        make: '',
        model: '',
        year: 0,
        vin: '',
      },
      service_items: [],
      description: '',
      service_details: {},
    };
  });

  useEffect(() => {
    localStorage.setItem('quoteRequestForm', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = useCallback((newData: Partial<ServiceFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...newData,
    }));
  }, []);

  const resetFormData = useCallback(() => {
    localStorage.removeItem('quoteRequestForm');
    setFormData({
      service_type: '',
      vehicleInfo: {
        make: '',
        model: '',
        year: 0,
        vin: '',
      },
      service_items: [],
      description: '',
      service_details: {},
    });
  }, []);

  return {
    formData,
    updateFormData,
    resetFormData,
  };
}
