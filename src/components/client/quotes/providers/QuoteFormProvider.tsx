
import { createContext, useContext, ReactNode } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formSchema } from '@/hooks/quote-request/formSchema'
import type { ServiceFormData } from '@/types/service-item'
import { Form } from '@/components/ui/form'

const QuoteFormContext = createContext<UseFormReturn<ServiceFormData> | null>(null)

export const useQuoteForm = () => {
  const context = useContext(QuoteFormContext)
  if (!context) throw new Error('useQuoteForm must be used within QuoteFormProvider')
  return context
}

interface QuoteFormProviderProps {
  children: ReactNode
  defaultValues?: Partial<ServiceFormData>
  onSubmit: (data: ServiceFormData) => Promise<void>
}

export function QuoteFormProvider({ children, defaultValues, onSubmit }: QuoteFormProviderProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(formSchema),
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
        saveToAccount: false,
      },
      service_items: [],
      service_details: {},
      ...defaultValues
    }
  })

  return (
    <QuoteFormContext.Provider value={form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {children}
        </form>
      </Form>
    </QuoteFormContext.Provider>
  )
}
