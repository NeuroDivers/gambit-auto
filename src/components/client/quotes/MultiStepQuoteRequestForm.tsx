
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
import { Progress } from "@/components/ui/progress"
import { ServiceTypeSelection } from "./form-steps/ServiceTypeSelection"

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

  const progress = (step / totalSteps) * 100

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      <VehicleInfoStep form={form} />
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
                        onServicesChange={(services) => form.setValue('service_items', services)}
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
                      form={form}
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
