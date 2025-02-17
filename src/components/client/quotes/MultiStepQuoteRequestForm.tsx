
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VehicleInfoStep } from "./form-steps/VehicleInfoStep"
import { ServiceDetailsStep } from "./form-steps/ServiceDetailsStep"
import { SummaryStep } from "./form-steps/SummaryStep"
import { FormNavigation } from "./form-steps/FormNavigation"
import { useQuoteRequestForm } from "@/hooks/useQuoteRequestForm"
import { AnimatePresence } from "framer-motion"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { motion } from "framer-motion"
import { QuoteRequestFormData, ServiceItemType } from "@/hooks/quote-request/formSchema"

export function MultiStepQuoteRequestForm() {
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

  const serviceItems = form.watch('service_items') || []

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Request a Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <VehicleInfoStep form={form} />
                    <ServiceSelectionField 
                      services={serviceItems}
                      onServicesChange={(services) => form.setValue('service_items', services)}
                    />
                  </motion.div>
                )}
                {step > 1 && step < totalSteps && selectedServices[step - 2] && (
                  <ServiceDetailsStep 
                    form={form}
                    services={services}
                    serviceId={selectedServices[step - 2].service_id}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                  />
                )}
                {step === totalSteps && (
                  <SummaryStep form={form} services={services} />
                )}
              </AnimatePresence>
            </div>

            <FormNavigation
              step={step}
              totalSteps={totalSteps}
              onNext={nextStep}
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
