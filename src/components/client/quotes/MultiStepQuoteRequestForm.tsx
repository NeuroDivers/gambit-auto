
import { QuoteFormProvider } from './providers/QuoteFormProvider'
import { ServiceSelectionForm } from './form-steps/service-selection/ServiceSelectionForm'
import { VehicleInfoStep } from './form-steps/VehicleInfoStep'
import { ServiceDetailsStep } from './form-steps/ServiceDetailsStep'
import { SummaryStep } from './form-steps/SummaryStep'
import { FormNavigation } from './form-steps/FormNavigation'
import { useQuoteRequestSubmission } from '@/hooks/quote-request/useQuoteRequestSubmission'
import { AnimatePresence, motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  onSuccess?: () => void
}

export function MultiStepQuoteRequestForm({ onSuccess }: Props) {
  const {
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
    selectedServiceId
  } = useQuoteRequestSubmission()

  const progress = (step / totalSteps) * 100

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
        <QuoteFormProvider onSubmit={handleSubmit}>
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <VehicleInfoStep 
                    form={form} 
                    onVehicleSave={onVehicleSave} 
                  />
                  <ServiceSelectionForm services={services || []} />
                </motion.div>
              )}

              {step > 1 && step < totalSteps && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ServiceDetailsStep
                    form={form}
                    services={services || []}
                    serviceId={selectedServiceId}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                  />
                </motion.div>
              )}

              {step === totalSteps && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SummaryStep 
                    form={form} 
                    services={services || []} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <FormNavigation
              step={step}
              totalSteps={totalSteps}
              onNext={nextStep}
              onPrevious={prevStep}
              isSubmitting={isSubmitting}
              uploading={uploading}
            />
          </div>
        </QuoteFormProvider>
      </CardContent>
    </Card>
  )
}
