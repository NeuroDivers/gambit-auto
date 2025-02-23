
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { useEffect, useRef } from "react"
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

interface CustomerInfoSectionProps {
  form: UseFormReturn<any>
}

export function CustomerInfoSection({ form }: CustomerInfoSectionProps) {
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

    // Add custom styles for the geocoder input
    const style = document.createElement('style')
    style.textContent = `
      .mapboxgl-ctrl-geocoder {
        width: 100% !important;
        max-width: none !important;
      }
    `
    document.head.appendChild(style)

    geocoder.current.on('result', (e: any) => {
      const result = e.result
      console.log('Geocoder result:', result)
      
      // Extract street address from the place name
      const streetAddress = result.place_name.split(',')[0]
      form.setValue('customer_street_address', streetAddress)
      
      if (result.context) {
        const city = result.context.find((c: any) => c.id.includes('place'))?.text
        const state = result.context.find((c: any) => c.id.includes('region'))?.text
        const postal = result.context.find((c: any) => c.id.includes('postcode'))?.text
        const country = result.context.find((c: any) => c.id.includes('country'))?.text

        if (city) form.setValue('customer_city', city)
        if (state) form.setValue('customer_state_province', state)
        if (postal) form.setValue('customer_postal_code', postal)
        if (country) form.setValue('customer_country', country)
      }
    })

    return () => {
      if (geocoder.current) {
        geocoder.current.onRemove()
      }
      // Clean up the added style
      style.remove()
    }
  }, [form])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_first_name"
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
            name="customer_last_name"
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
            name="customer_email"
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
            name="customer_phone"
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

        <FormLabel>Address Search</FormLabel>
        <div ref={geocoderContainerRef} className="mb-4" />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_street_address"
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

          <FormField
            control={form.control}
            name="customer_unit_number"
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_city"
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
            name="customer_state_province"
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
            name="customer_postal_code"
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
            name="customer_country"
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
      </CardContent>
    </Card>
  )
}
