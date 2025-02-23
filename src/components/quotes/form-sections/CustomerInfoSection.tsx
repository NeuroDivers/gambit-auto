
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UseFormReturn } from "react-hook-form"
import { useEffect, useState } from "react"
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

type FormData = {
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_unit_number: string
  customer_street_address: string
  customer_city: string
  customer_state_province: string
  customer_postal_code: string
  customer_country: string
}

interface CustomerInfoSectionProps {
  form: UseFormReturn<any>
}

export function CustomerInfoSection({ form }: CustomerInfoSectionProps) {
  const [geocoder, setGeocoder] = useState<any>(null)

  useEffect(() => {
    // Initialize Mapbox geocoder
    const geocoderInstance = new MapboxGeocoder({
      accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
      countries: 'US,CA',
      types: 'address',
      placeholder: 'Enter address'
    })

    geocoderInstance.on('result', (e: any) => {
      const result = e.result
      if (result.properties?.address) {
        form.setValue('customer_street_address', result.properties.address)
      }
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
    }, 'result')

    setGeocoder(geocoderInstance)

    return () => {
      if (geocoderInstance) {
        geocoderInstance.off('result')
      }
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

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customer_street_address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <div ref={(el) => {
                      if (el && geocoder) {
                        el.innerHTML = ''
                        el.appendChild(geocoder.onAdd())
                      }
                    }} />
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
        </div>
      </CardContent>
    </Card>
  )
}
