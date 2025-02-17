
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VehicleInfoStep } from "./form-steps/VehicleInfoStep"
import { ServiceDetailsStep } from "./form-steps/ServiceDetailsStep"
import { SummaryStep } from "./form-steps/SummaryStep"
import { FormNavigation } from "./form-steps/FormNavigation"
import { useQuoteRequestForm } from "@/hooks/useQuoteRequestForm"
import { AnimatePresence } from "framer-motion"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { ServiceTypeSelection } from "./form-steps/ServiceTypeSelection"
import { toast } from "sonner"
import type { QuoteRequestFormData, ServiceItemType } from "@/types/quote-request"

type Props = {
  onSuccess?: () => void;
}

export function MultiStepQuoteRequestForm({ onSuccess }: Props) {
  const {
    form,
    step,
    totalSteps,
    services,
    selectedServices,
    uploading,
    isSubmitting,
    handleImageUpload,
    handleImageRemove,
    onSubmit,
    nextStep,
    prevStep
  } = useQuoteRequestForm()

  const progress = (step / totalSteps) * 100

  const handleSubmit = async (data: QuoteRequestFormData) => {
    if (step === totalSteps) {
      try {
        await onSubmit(data)
        toast.success("Quote request submitted successfully!")
        onSuccess?.()
      } catch (error) {
        toast.error("Failed to submit quote request")
      }
    } else {
      nextStep()
    }
  }

  const handleServiceChange = (services: ServiceItemType[]) => {
    form.setValue('service_items', services, {
      shouldValidate: true
    })
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="pb-4 space-y-6">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Request a Quote</CardTitle>
          <p className="text-muted-foreground">
            Tell us about your vehicle and the services you're interested in.
          </p>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="rounded-lg border bg-card p-6 space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Vehicle Information</h2>
                        <p className="text-sm text-muted-foreground">
                          Enter your vehicle details to help us provide accurate service quotes.
                        </p>
                      </div>
                      <VehicleInfoStep form={form as any} />
                    </div>

                    <div className="rounded-lg border bg-card p-6 space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Select Services</h2>
                        <p className="text-sm text-muted-foreground">
                          Choose the services you're interested in.
                        </p>
                      </div>
                      <ServiceTypeSelection 
                        services={services || []}
                        selectedServices={selectedServices}
                        onServicesChange={handleServiceChange}
                      />
                    </div>
                  </motion.div>
                )}

                {step > 1 && step < totalSteps && selectedServices[step - 2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg border bg-card p-6"
                  >
                    <ServiceDetailsStep 
                      form={form as any}
                      services={services || []}
                      serviceId={selectedServices[step - 2].service_id}
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
                    transition={{ duration: 0.3 }}
                    className="rounded-lg border bg-card p-6"
                  >
                    <SummaryStep form={form} services={services || []} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <FormNavigation
              step={step}
              totalSteps={totalSteps}
              onNext={form.handleSubmit(handleSubmit)}
              onPrevious={prevStep}
              isSubmitting={isSubmitting}
              uploading={uploading}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
