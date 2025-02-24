import React, { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/types/service-item"

const quoteSchema = z.object({
  quote_number: z.string().min(3, {
    message: "Quote number must be at least 3 characters.",
  }),
  customer_first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  customer_last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  customer_email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  vehicle_make: z.string().min(2, {
    message: "Vehicle make must be at least 2 characters.",
  }),
  vehicle_model: z.string().min(2, {
    message: "Vehicle model must be at least 2 characters.",
  }),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear()),
  status: z.enum(["draft", "sent", "accepted", "rejected"]),
  subtotal: z.number(),
  total: z.number(),
})

export type QuoteFormValues = z.infer<typeof quoteSchema>

export interface QuoteFormProps {
  quote?: any // Replace with proper type
  onSuccess?: () => void
  defaultServices?: ServiceItemType[]
}

export function QuoteForm({ quote, onSuccess, defaultServices = [] }: QuoteFormProps) {
  const [services, setServices] = useState<ServiceItemType[]>(defaultServices)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      quote_number: quote?.quote_number || "",
      customer_first_name: quote?.customer_first_name || "",
      customer_last_name: quote?.customer_last_name || "",
      customer_email: quote?.customer_email || "",
      vehicle_make: quote?.vehicle_make || "",
      vehicle_model: quote?.vehicle_model || "",
      vehicle_year: quote?.vehicle_year || new Date().getFullYear(),
      status: quote?.status || "draft",
      subtotal: quote?.subtotal || 0,
      total: quote?.total || 0,
    },
    mode: "onChange",
  })

  const { data: servicesData } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
      if (error) throw error
      return data
    },
  })

  const { mutate: updateQuote, isLoading: isUpdating } = useMutation({
    mutationFn: async (values: QuoteFormValues) => {
      const { data, error } = await supabase
        .from("quotes")
        .update(values)
        .eq("id", quote.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast({
        title: "Success",
        description: "Quote updated successfully.",
      })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    },
  })

  const { mutate: createQuote, isLoading: isCreating } = useMutation({
    mutationFn: async (values: QuoteFormValues) => {
      const { data, error } = await supabase
        .from("quotes")
        .insert(values)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast({
        title: "Success",
        description: "Quote created successfully.",
      })
      navigate("/admin/quotes")
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    },
  })

  const onSubmit = (values: QuoteFormValues) => {
    if (quote) {
      updateQuote(values)
    } else {
      createQuote(values)
    }
  }

  const handleServicesChange = useCallback((newServices: ServiceItemType[]) => {
    setServices(newServices)
  }, [])

  useEffect(() => {
    if (quote) {
      form.reset({
        quote_number: quote.quote_number,
        customer_first_name: quote.customer_first_name,
        customer_last_name: quote.customer_last_name,
        customer_email: quote.customer_email,
        vehicle_make: quote.vehicle_make,
        vehicle_model: quote.vehicle_model,
        vehicle_year: quote.vehicle_year,
        status: quote.status,
        subtotal: quote.subtotal,
        total: quote.total,
      })
    }
  }, [quote, form.reset])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 rounded-lg border p-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Quote Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="quote_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Number</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-2023-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Camry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2023"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          form.setValue("vehicle_year", value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceSelectionField
              services={servicesData || []}
              onChange={handleServicesChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="subtotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtotal</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          form.setValue("subtotal", value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          form.setValue("total", value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/admin/quotes")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {quote ? (isUpdating ? "Updating..." : "Update Quote") : (isCreating ? "Creating..." : "Create Quote")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
