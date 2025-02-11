
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VehicleInfoStep } from "./form-steps/VehicleInfoStep"
import { ServiceSelectionStep } from "./form-steps/ServiceSelectionStep"
import { ServiceDetailsStep } from "./form-steps/ServiceDetailsStep"
import { SummaryStep } from "./form-steps/SummaryStep"
import { FormNavigation } from "./form-steps/FormNavigation"
import { useQuoteRequestForm } from "@/hooks/useQuoteRequestForm"
import { AnimatePresence } from "framer-motion"

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <VehicleInfoStep form={form} />
                )}
                {step === 2 && (
                  <ServiceSelectionStep form={form} />
                )}
                {step > 2 && step < totalSteps && selectedServices[step - 3] && (
                  <ServiceDetailsStep 
                    form={form}
                    services={services}
                    serviceId={selectedServices[step - 3].service_id}
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
