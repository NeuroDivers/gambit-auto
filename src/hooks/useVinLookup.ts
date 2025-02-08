
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
        const { data: cachedData } = await supabase
          .from('vin_lookups')
          .select('*')
          .eq('vin', vin)
          .maybeSingle()

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

        // Only cache valid results
        if (make && model && year) {
          // Cache the result
          const { error: cacheError } = await supabase
            .from('vin_lookups')
            .insert({
              vin,
              make,
              model,
              year,
              raw_data: data
            })

          if (cacheError) {
            console.error('Failed to cache VIN lookup:', cacheError)
          }

          return { make, model, year }
        }

        throw new Error('Could not decode VIN')
      } catch (error: any) {
        // Cache failed lookups too
        const { error: cacheError } = await supabase
          .from('vin_lookups')
          .insert({
            vin,
            success: false,
            error_message: error.message
          })

        if (cacheError) {
          console.error('Failed to cache VIN lookup error:', cacheError)
        }

        return { error: error.message }
      }
    },
    enabled: vin?.length === 17
  })
}
