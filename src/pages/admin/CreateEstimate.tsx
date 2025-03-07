import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useForm, UseFormReturn } from "react-hook-form"
import { EstimateFormValues } from "@/components/estimates/types/estimate-form"
import { WorkOrderFormValues } from "@/components/work-orders/types"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PageTitle } from "@/components/shared/PageTitle"
import { Form } from "@/components/ui/form"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ArrowLeft, ArrowRight, Search, Plus, Check } from "lucide-react"
import { EstimateFormAdapter } from "@/components/estimates/EstimateFormAdapter"
import { ClientInfoFields } from "@/components/work-orders/form-sections/ClientInfoFields"
import { VehicleInfoFields } from "@/components/work-orders/form-sections/VehicleInfoFields"
import { ServiceSelectionFields } from "@/components/work-orders/form-sections/ServiceSelectionFields"
import { SchedulingFields } from "@/components/work-orders/form-sections/SchedulingFields"
import { NotesFields } from "@/components/work-orders/form-sections/NotesFields"
import { Separator } from "@/components/ui/separator"

const STEPS = [
  { id: "customer", label: "Customer Information" },
  { id: "vehicle", label: "Vehicle Information" },
  { id: "services", label: "Services" },
  { id: "scheduling", label: "Scheduling" },
  { id: "notes", label: "Notes & Review" },
];

const estimateSchema = z.object({
  customer_first_name: z.string().min(1, "First name is required"),
  customer_last_name: z.string().min(1, "Last name is required"),
  customer_email: z.string().email("Invalid email address"),
  customer_phone: z.string().min(1, "Phone number is required"),
  contact_preference: z.enum(["phone", "email"]),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_vin: z.string().optional(),
  vehicle_color: z.string().optional(),
  vehicle_body_class: z.string().optional(),
  vehicle_doors: z.number().nullable().optional(),
  vehicle_trim: z.string().optional(),
  vehicle_license_plate: z.string().optional(),
  additional_notes: z.string().optional(),
  customer_address: z.string().optional(),
  customer_street_address: z.string().optional(),
  customer_unit_number: z.string().optional(),
  customer_city: z.string().optional(),
  customer_state_province: z.string().optional(),
  customer_postal_code: z.string().optional(),
  customer_country: z.string().optional(),
  estimated_duration: z.number().nullable(),
  end_time: z.date().nullable(),
  assigned_bay_id: z.string().nullable(),
  client_id: z.string().optional(),
  service_items: z.array(z.object({
    service_id: z.string(),
    service_name: z.string(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
    commission_rate: z.number(),
    commission_type: z.enum(['percentage', 'flat']).nullable(),
    assigned_profile_id: z.string().nullable().optional(),
    description: z.string().optional(),
    sub_services: z.array(z.object({
      service_id: z.string(),
      service_name: z.string(),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
      commission_rate: z.number().optional(),
      commission_type: z.enum(['percentage', 'flat']).nullable().optional(),
      assigned_profile_id: z.string().nullable().optional(),
      description: z.string().optional(),
      parent_id: z.string().optional()
    })).optional()
  })),
  total: z.number().min(0),
  services: z.array(z.object({
    service_id: z.string().optional(),
    service_name: z.string().optional(),
    quantity: z.number().optional(),
    unit_price: z.number().optional(),
    commission_rate: z.number().optional(),
    commission_type: z.enum(['percentage', 'flat']).nullable().optional(),
    assigned_profile_id: z.string().nullable().optional(),
    description: z.string().optional(),
    sub_services: z.array(z.object({
      service_id: z.string().optional(),
      service_name: z.string().optional(),
      quantity: z.number().optional(),
      unit_price: z.number().optional(),
      commission_rate: z.number().optional(),
      commission_type: z.enum(['percentage', 'flat']).nullable().optional(),
      assigned_profile_id: z.string().nullable().optional(),
      description: z.string().optional(),
      parent_id: z.string().optional()
    })).optional(),
    is_parent: z.boolean().optional()
  })).optional()
})

export default function CreateEstimate() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      contact_preference: "email",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: "",
      additional_notes: "",
      start_time: null,
      estimated_duration: null,
      end_time: null,
      assigned_bay_id: null,
      service_items: [],
      total: 0,
      services: [],
      client_id: "",
      customer_street_address: "",
      customer_unit_number: "", 
      customer_city: "",
      customer_state_province: "",
      customer_postal_code: "",
      customer_country: "",
      notes: '',
      status: 'draft'
    }
  })

  const { data: estimateRequest, isLoading: isLoadingRequest } = useQuery({
    queryKey: ["estimate_request", requestId],
    queryFn: async () => {
      if (!requestId) return null

      const { data, error } = await supabase
        .from("estimate_requests")
        .select(`
          *,
          customers (
            id, 
            first_name, 
            last_name, 
            email, 
            phone_number,
            street_address,
            unit_number,
            city,
            state_province,
            postal_code,
            country
          ),
          vehicles (
            id,
            make,
            model,
            year,
            vin,
            color,
            trim,
            body_class,
            doors
          ),
          request_services (
            id,
            service_type_id,
            service_types (
              id,
              name,
              price,
              duration,
              description
            )
          ),
          request_media (
            id,
            media_url
          )
        `)
        .eq("id", requestId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!requestId
  })

  useEffect(() => {
    if (estimateRequest && !isLoadingRequest) {
      const customer = estimateRequest.customers
      const vehicle = estimateRequest.vehicles

      if (customer) {
        form.setValue("customer_first_name", customer.first_name || "")
        form.setValue("customer_last_name", customer.last_name || "")
        form.setValue("customer_email", customer.email || "")
        form.setValue("customer_phone", customer.phone_number || "")
        form.setValue("customer_street_address", customer.street_address || "")
        form.setValue("customer_unit_number", customer.unit_number || "")
        form.setValue("customer_city", customer.city || "")
        form.setValue("customer_state_province", customer.state_province || "")
        form.setValue("customer_postal_code", customer.postal_code || "")
        form.setValue("customer_country", customer.country || "")
      }

      if (vehicle) {
        form.setValue("vehicle_make", vehicle.make || "")
        form.setValue("vehicle_model", vehicle.model || "")
        form.setValue("vehicle_year", vehicle.year || new Date().getFullYear())
        form.setValue("vehicle_vin", vehicle.vin || "")
        form.setValue("vehicle_color", vehicle.color || "")
        form.setValue("vehicle_trim", vehicle.trim || "")
        form.setValue("vehicle_body_class", vehicle.body_class || "")
        if (vehicle.doors) form.setValue("vehicle_doors", vehicle.doors)
      } else {
        form.setValue("vehicle_make", estimateRequest.vehicle_make || "")
        form.setValue("vehicle_model", estimateRequest.vehicle_model || "")
        form.setValue("vehicle_year", estimateRequest.vehicle_year || new Date().getFullYear())
      }

      form.setValue("additional_notes", estimateRequest.description || "")

      if (estimateRequest.request_services && estimateRequest.request_services.length > 0) {
        const serviceItems = estimateRequest.request_services.map(service => ({
          service_id: service.service_type_id,
          service_name: service.service_types?.name || "",
          quantity: 1,
          unit_price: service.service_types?.price || 0,
          commission_rate: 0,
          commission_type: null as 'percentage' | 'flat' | null,
        }))
        form.setValue("service_items", serviceItems)
      }
    }
  }, [estimateRequest, form, isLoadingRequest])

  const onSubmit = async (data: EstimateFormValues) => {
    try {
      setIsSubmitting(true)
      console.log("Submitting estimate:", data)

      const total = data.service_items.reduce((acc, item) => {
        const itemTotal = (item.quantity || 1) * (item.unit_price || 0)
        const subServicesTotal = (item.sub_services || []).reduce(
          (subAcc, subItem) => subAcc + (subItem.quantity || 1) * (subItem.unit_price || 0),
          0
        )
        return acc + itemTotal + subServicesTotal
      }, 0)

      const estimateData = {
        estimate_number: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        customer_first_name: data.customer_first_name,
        customer_last_name: data.customer_last_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        contact_preference: data.contact_preference,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year: data.vehicle_year,
        vehicle_vin: data.vehicle_vin,
        vehicle_color: data.vehicle_color,
        vehicle_body_class: data.vehicle_body_class,
        vehicle_doors: data.vehicle_doors,
        vehicle_trim: data.vehicle_trim,
        vehicle_license_plate: data.vehicle_license_plate,
        additional_notes: data.additional_notes,
        customer_street_address: data.customer_street_address,
        customer_unit_number: data.customer_unit_number,
        customer_city: data.customer_city,
        customer_state_province: data.customer_state_province,
        customer_postal_code: data.customer_postal_code,
        customer_country: data.customer_country,
        subtotal: total,
        total: total,
        status: "draft",
        created_at: new Date().toISOString(),
        estimate_request_id: requestId || null
      }

      const { data: estimate, error } = await supabase
        .from("estimates")
        .insert(estimateData)
        .select()
        .single()

      if (error) throw error

      if (data.service_items && data.service_items.length > 0) {
        const estimateServices = data.service_items.map(service => ({
          estimate_id: estimate.id,
          service_id: service.service_id,
          service_name: service.service_name,
          quantity: service.quantity || 1,
          unit_price: service.unit_price || 0,
          total_price: (service.quantity || 1) * (service.unit_price || 0)
        }))

        const { error: serviceError } = await supabase
          .from("estimate_services")
          .insert(estimateServices)

        if (serviceError) throw serviceError
      }

      if (requestId) {
        const { error: updateError } = await supabase
          .from("estimate_requests")
          .update({ status: "estimated" })
          .eq("id", requestId)

        if (updateError) throw updateError
      }

      toast.success("Estimate created successfully")
      navigate("/estimates")
    } catch (error: any) {
      console.error("Error creating estimate:", error)
      toast.error("Failed to create estimate: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCustomerSelect = async (customerId: string) => {
    if (!customerId) return;

    form.setValue("client_id" as any, selectedClient.id);

    supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching customer:", error);
          return;
        }
        
        if (data) {
          form.setValue("customer_first_name", data.first_name || "");
          form.setValue("customer_last_name", data.last_name || "");
          form.setValue("customer_email", data.email || "");
          form.setValue("customer_phone", data.phone_number || "");
          form.setValue("customer_street_address", data.street_address || "");
          form.setValue("customer_unit_number", data.unit_number || "");
          form.setValue("customer_city", data.city || "");
          form.setValue("customer_state_province", data.state_province || "");
          form.setValue("customer_postal_code", data.postal_code || "");
          form.setValue("customer_country", data.country || "");
        }
      });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "customer":
        return (
          <EstimateFormAdapter form={form}>
            <ClientInfoFields 
              form={form as unknown as UseFormReturn<WorkOrderFormValues>} 
              onCustomerSelect={handleCustomerSelect}
            />
          </EstimateFormAdapter>
        );
      case "vehicle":
        return (
          <EstimateFormAdapter form={form}>
            <VehicleInfoFields form={form as unknown as UseFormReturn<WorkOrderFormValues>} />
          </EstimateFormAdapter>
        );
      case "services":
        return (
          <EstimateFormAdapter form={form}>
            <ServiceSelectionFields form={form as unknown as UseFormReturn<WorkOrderFormValues>} />
          </EstimateFormAdapter>
        );
      case "scheduling":
        return (
          <EstimateFormAdapter form={form}>
            <SchedulingFields form={form as unknown as UseFormReturn<WorkOrderFormValues>} />
          </EstimateFormAdapter>
        );
      case "notes":
        return (
          <EstimateFormAdapter form={form}>
            <NotesFields form={form as unknown as UseFormReturn<WorkOrderFormValues>} />
          </EstimateFormAdapter>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <PageTitle
              title={requestId ? "Create Estimate from Request" : "Create New Estimate"}
              description="Create and send an estimate to your customer"
            />
          </div>
          <div className="flex items-center gap-2">
            {!requestId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => navigate("/estimate-requests")}
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Find Requests</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Browse estimate requests to create from
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isSubmitting ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Create Estimate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="w-full flex items-center justify-between mb-8">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div 
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                      ${index === currentStep 
                        ? "border-primary bg-primary text-primary-foreground" 
                        : index < currentStep 
                          ? "border-primary bg-primary/20 text-primary" 
                          : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    {index < STEPS.length - 1 && (
                      <div 
                        className={`h-0.5 w-16 md:w-24 lg:w-36 mx-1 
                        ${index < currentStep ? "bg-primary" : "bg-muted-foreground/30"}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold">{STEPS[currentStep].label}</h2>
              </div>

              <Card>
                <CardContent className="p-6">
                  {renderStep()}
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[150px]"
                  >
                    {isSubmitting ? "Creating..." : "Create Estimate"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
