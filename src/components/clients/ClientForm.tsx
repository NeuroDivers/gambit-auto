
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { Client } from "./types"
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  unit_number: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
})

type ClientFormProps = {
  client?: Client
  onSuccess?: () => void
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: client?.first_name || "",
      last_name: client?.last_name || "",
      email: client?.email || "",
      phone_number: client?.phone_number || "",
      unit_number: client?.unit_number || "",
      street_address: client?.street_address || "",
      city: client?.city || "",
      state_province: client?.state_province || "",
      postal_code: client?.postal_code || "",
      country: client?.country || "",
    },
  })

  const geocoderContainerRef = useRef<HTMLDivElement>(null)
  const geocoder = useRef<any>(null)

  useEffect(() => {
    if (!geocoderContainerRef.current) return

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    if (!token) {
      console.error('Mapbox access token is not configured')
      return
    }

    geocoder.current = new MapboxGeocoder({
      accessToken: token,
      countries: 'US,CA',
      types: 'address',
      placeholder: 'Enter address'
    })

    const container = geocoderContainerRef.current
    container.innerHTML = ''
    container.appendChild(geocoder.current.onAdd())

    geocoder.current.on('result', (e: any) => {
      const result = e.result
      console.log('Geocoder result:', result)
      
      // Extract street address from the place name
      const streetAddress = result.place_name.split(',')[0]
      form.setValue('street_address', streetAddress)
      
      if (result.context) {
        const city = result.context.find((c: any) => c.id.includes('place'))?.text
        const state = result.context.find((c: any) => c.id.includes('region'))?.text
        const postal = result.context.find((c: any) => c.id.includes('postcode'))?.text
        const country = result.context.find((c: any) => c.id.includes('country'))?.text

        if (city) form.setValue('city', city)
        if (state) form.setValue('state_province', state)
        if (postal) form.setValue('postal_code', postal)
        if (country) form.setValue('country', country)
      }
    })

    return () => {
      if (geocoder.current) {
        geocoder.current.onRemove()
      }
    }
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (client) {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update(values)
          .eq("id", client.id)

        if (error) throw error
        toast.success("Client updated successfully")
      } else {
        // Create new client
        const { error } = await supabase
          .from("clients")
          .insert(values)

        if (error) throw error
        toast.success("Client created successfully")
      }

      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving client:', error)
      toast.error("Failed to save client")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormLabel>Address</FormLabel>
        <div ref={geocoderContainerRef} className="mb-4" />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unit_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit/Apt #</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="street_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state_province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal/ZIP Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          {client ? "Update Client" : "Create Client"}
        </Button>
      </form>
    </Form>
  )
}
