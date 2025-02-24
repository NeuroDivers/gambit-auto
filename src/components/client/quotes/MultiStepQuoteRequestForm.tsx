
import { QuoteFormProvider } from './providers/QuoteFormProvider'
import { ServiceSelectionForm } from './form-steps/service-selection/ServiceSelectionForm'
import { VehicleInfoStep } from './form-steps/VehicleInfoStep'
import { ServiceDetailsStep } from './form-steps/ServiceDetailsStep'
import { SummaryStep } from './form-steps/SummaryStep'
import { FormNavigation } from './form-steps/FormNavigation'
import { useQuoteRequestSubmission } from '@/hooks/quote-request/useQuoteRequestSubmission'
import { AnimatePresence, motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import type { ServiceFormData } from '@/types/service-item'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  onSuccess?: () => void
}

export function MultiStepQuoteRequestForm({ onSuccess }: Props) {
  const {
    step,
    totalSteps,
    services,
    isSubmitting,
    handleSubmit
  } = useQuoteRequestSubmission()

  const progress = (step / totalSteps) * 100

  const onSubmitForm = async (data: ServiceFormData) => {
    try {
      await handleSubmit(data)
      toast.success("Quote request submitted successfully!")
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to submit quote request")
    }
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="pb-4 space-y-6">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Request a Quote
          </CardTitle>
          <p className="text-muted-foreground">
            Tell us about your vehicle and the services you're interested in.
          </p>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <QuoteFormProvider onSubmit={onSubmitForm}>
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <VehicleInfoStep />
                  <ServiceSelectionForm services={services || []} />
                </motion.div>
              )}

              {step > 1 && step < totalSteps && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ServiceDetailsStep />
                </motion.div>
              )}

              {step === totalSteps && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SummaryStep />
                </motion.div>
              )}
            </AnimatePresence>

            <FormNavigation
              step={step}
              totalSteps={totalSteps}
              isSubmitting={isSubmitting}
            />
          </div>
        </QuoteFormProvider>
      </CardContent>
    </Card>
  )
}
