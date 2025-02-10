
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface VinLookupResult {
  make?: string
  model?: string
  year?: number
  error?: string
}

export function useVinLookup(vin: string) {
  return useQuery({
    queryKey: ['vin-lookup', vin],
    queryFn: async (): Promise<VinLookupResult> => {
      if (!vin || vin.length !== 17) {
        return {}
      }

      try {
        // First check our local cache
        const { data: cachedData, error: cacheError } = await supabase
          .from('vin_lookups')
          .select('*')
          .eq('vin', vin)
          .maybeSingle()

        if (cacheError) {
          console.error('Cache lookup error:', cacheError)
          throw cacheError
        }

        if (cachedData) {
          if (!cachedData.success) {
            throw new Error(cachedData.error_message || 'Failed to decode VIN')
          }
          return {
            make: cachedData.make,
            model: cachedData.model,
            year: cachedData.year
          }
        }

        // If not in cache, fetch from NHTSA API
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error('Failed to fetch vehicle information')
        }

        const results = data.Results
        const make = results.find((r: any) => r.Variable === 'Make')?.Value
        const model = results.find((r: any) => r.Variable === 'Model')?.Value
        const yearResult = results.find((r: any) => r.Variable === 'ModelYear')?.Value
        const year = yearResult ? parseInt(yearResult) : undefined

        if (make && model && year) {
          // Cache the successful result
          const { error: insertError } = await supabase
            .from('vin_lookups')
            .upsert({
              vin,
              make,
              model,
              year,
              raw_data: data,
              success: true,
              error_message: null
            })

          if (insertError) {
            console.error('Failed to cache VIN lookup:', insertError)
          }

          return { make, model, year }
        }

        throw new Error('Could not decode VIN')
      } catch (error: any) {
        // Cache the failed lookup
        const { error: insertError } = await supabase
          .from('vin_lookups')
          .upsert({
            vin,
            success: false,
            error_message: error.message,
            make: null,
            model: null,
            year: null,
            raw_data: null
          })

        if (insertError) {
          console.error('Failed to cache VIN lookup error:', insertError)
        }

        return { error: error.message }
      }
    },
    enabled: vin?.length === 17,
    staleTime: 1000 * 60 * 60 // Cache for 1 hour
  })
}
