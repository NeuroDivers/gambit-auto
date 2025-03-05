
import { useState, useEffect } from 'react';
import { ServiceFormData } from '@/types/service-item';

export function useFormStorage() {
  const [formData, setFormData] = useState<ServiceFormData>({
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
  });

  // Load form data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('quoteRequestForm');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing stored form data:', error);
        // If there's an error, clear the stored data
        localStorage.removeItem('quoteRequestForm');
      }
    }
  }, []);

  // Function to update form data and save to localStorage
  const updateFormData = (newData: Partial<ServiceFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('quoteRequestForm', JSON.stringify(updated));
      return updated;
    });
  };

  // Function to clear stored form data
  const clearStoredFormData = () => {
    localStorage.removeItem('quoteRequestForm');
    setFormData({
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
    });
  };

  return { formData, updateFormData, clearStoredFormData };
}
