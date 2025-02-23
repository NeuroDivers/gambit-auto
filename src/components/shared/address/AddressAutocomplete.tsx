
import { useEffect, useRef } from "react"
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { UseFormReturn } from "react-hook-form"

interface AddressAutocompleteProps {
  form: UseFormReturn<any>
  fieldPrefix?: string
}

export function AddressAutocomplete({ form, fieldPrefix = "customer_" }: AddressAutocompleteProps) {
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
      form.setValue(`${fieldPrefix}street_address`, streetAddress)
      
      if (result.context) {
        const city = result.context.find((c: any) => c.id.includes('place'))?.text
        const state = result.context.find((c: any) => c.id.includes('region'))?.text
        const postal = result.context.find((c: any) => c.id.includes('postcode'))?.text
        const country = result.context.find((c: any) => c.id.includes('country'))?.text

        if (city) form.setValue(`${fieldPrefix}city`, city)
        if (state) form.setValue(`${fieldPrefix}state_province`, state)
        if (postal) form.setValue(`${fieldPrefix}postal_code`, postal)
        if (country) form.setValue(`${fieldPrefix}country`, country)
      }
    })

    return () => {
      if (geocoder.current) {
        geocoder.current.onRemove()
      }
      // Clean up the added style
      style.remove()
    }
  }, [form, fieldPrefix])

  return <div ref={geocoderContainerRef} className="mb-4" />
}
