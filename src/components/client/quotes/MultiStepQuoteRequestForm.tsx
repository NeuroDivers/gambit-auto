import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AutoDetailingField } from './form-steps/service-details/AutoDetailingField';
import { PPFPackageField } from './form-steps/service-details/PPFPackageField';
import { WindowTintField } from './form-steps/service-details/WindowTintField';
import { ServiceImageUpload } from './form-steps/service-details/ServiceImageUpload';
import { UseFormReturn } from "react-hook-form";
import { ServiceItemType } from "@/types/service-item";

const quoteRequestFormSchema = z.object({
  vehicleInfo: z.object({
    make: z.string().min(1, { message: "Make is required" }),
    model: z.string().min(1, { message: "Model is required" }),
    year: z.string().min(4, { message: "Year must be 4 digits" }),
    vin: z.string().optional(),
    color: z.string().optional(),
    saveToAccount: z.boolean().default(false),
  }),
  serviceType: z.string().min(1, { message: "Service type is required" }),
  details: z.record(z.any()).optional(),
  images: z.array(z.string()).optional(),
  description: z.string().optional(),
  saveToAccount: z.boolean().default(false),
});

type QuoteRequestFormValues = z.infer<typeof quoteRequestFormSchema>

interface MultiStepQuoteRequestFormProps {
  onSuccess: () => void;
  quoteRequestForm?: UseFormReturn<any>;
}

export function MultiStepQuoteRequestForm({ onSuccess, quoteRequestForm }: MultiStepQuoteRequestFormProps) {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<QuoteRequestFormValues>({
    resolver: zodResolver(quoteRequestFormSchema),
    defaultValues: {
      vehicleInfo: {
        make: "",
        model: "",
        year: new Date().getFullYear().toString(),
        vin: "",
        color: "",
        saveToAccount: false,
      },
      serviceType: "",
      details: {},
      images: [],
      description: "",
      saveToAccount: false,
    },
  });

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (values: QuoteRequestFormValues) => {
    console.log("Form Values:", values);
    onSuccess();
  };

  const handleImageUpload = (url: string) => {
    setImages([...images, url]);
    form.setValue("images", [...images, url]);
  };

  const handleRemoveImage = (imageUrl: string) => {
    const updatedImages = images.filter((img) => img !== imageUrl);
    setImages(updatedImages);
    form.setValue("images", updatedImages);
  };

  const steps = [
    {
      label: "Vehicle Information",
      content: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="vehicleInfo.make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input placeholder="Make" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicleInfo.model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="Model" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicleInfo.year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input placeholder="Year" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicleInfo.vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="VIN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicleInfo.color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vehicleInfo.saveToAccount"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Save Vehicle to Account</FormLabel>
                  <FormDescription>
                    Save this vehicle to your account for future use.
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      label: "Service Selection",
      content: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="autoDetailing">Auto Detailing</SelectItem>
                    <SelectItem value="ppfPackage">PPF Package</SelectItem>
                    <SelectItem value="windowTint">Window Tint</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.getValues("serviceType") === "autoDetailing" && (
            <AutoDetailingField
              form={form}
              serviceId="autoDetailing"
            />
          )}
          {form.getValues("serviceType") === "ppfPackage" && (
            <PPFPackageField
              form={form}
              serviceId="ppfPackage"
            />
          )}
          {form.getValues("serviceType") === "windowTint" && (
            <WindowTintField
              form={form}
              serviceId="windowTint"
            />
          )}
        </div>
      ),
    },
    {
      label: "Additional Details",
      content: (
        <div className="space-y-4">
          <ServiceImageUpload
            images={images}
            onImageUpload={handleImageUpload}
            onRemove={handleRemoveImage}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your service needs"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="saveToAccount"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Save Details to Account</FormLabel>
                  <FormDescription>
                    Save these details to your account for future use.
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">{steps[step].label}</h2>
          {steps[step].content}
        </div>

        <div className="flex justify-between">
          {step > 0 && (
            <Button variant="secondary" onClick={handlePrev}>
              Previous
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button type="submit">Submit</Button>
          )}
        </div>
      </form>
    </Form>
  );
}
