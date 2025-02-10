
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

        // Cache the result, whether successful or not
        const { error: upsertError } = await supabase
          .from('vin_lookups')
          .upsert({
            vin,
            make: make || null,
            model: model || null,
            year: year || null,
            raw_data: data,
            success: !!(make && model && year),
            error_message: !make || !model || !year ? 'Could not decode VIN' : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (upsertError) {
          console.error('Failed to cache VIN lookup:', upsertError)
        }

        if (make && model && year) {
          return { make, model, year }
        }

        throw new Error('Could not decode VIN')
      } catch (error: any) {
        console.error('VIN lookup error:', error)
        
        // Cache the error result
        const { error: upsertError } = await supabase
          .from('vin_lookups')
          .upsert({
            vin,
            success: false,
            error_message: error.message,
            make: null,
            model: null,
            year: null,
            raw_data: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (upsertError) {
          console.error('Failed to cache VIN lookup error:', upsertError)
        }

        return { error: error.message }
      }
    },
    enabled: vin?.length === 17,
    staleTime: 1000 * 60 * 60 // Cache for 1 hour
  })
}
