
import { useEffect, useRef } from "react"
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { UseFormSetValue } from "react-hook-form"
import { ClientFormValues } from "../schemas/clientFormSchema"

interface AddressAutocompleteProps {
  setValue: UseFormSetValue<ClientFormValues>
}

export function AddressAutocomplete({ setValue }: AddressAutocompleteProps) {
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
      setValue('street_address', streetAddress)
      
      if (result.context) {
        const city = result.context.find((c: any) => c.id.includes('place'))?.text
        const state = result.context.find((c: any) => c.id.includes('region'))?.text
        const postal = result.context.find((c: any) => c.id.includes('postcode'))?.text
        const country = result.context.find((c: any) => c.id.includes('country'))?.text

        if (city) setValue('city', city)
        if (state) setValue('state_province', state)
        if (postal) setValue('postal_code', postal)
        if (country) setValue('country', country)
      }
    })

    return () => {
      if (geocoder.current) {
        geocoder.current.onRemove()
      }
    }
  }, [setValue])

  return <div ref={geocoderContainerRef} className="mb-4" />
}
