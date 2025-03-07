
import React, { createContext, ReactNode } from 'react';
import { ServiceFormData } from '@/types/service-item';

interface QuoteFormContextProps {
  onSubmit: (data: ServiceFormData) => void;
  children: ReactNode;
}

export const QuoteFormContext = createContext<{
  onSubmit: (data: ServiceFormData) => void;
}>({
  onSubmit: () => {},
});

export function QuoteFormProvider({ children, onSubmit }: QuoteFormContextProps) {
  return (
    <QuoteFormContext.Provider value={{ onSubmit }}>
      {children}
    </QuoteFormContext.Provider>
  );
}
